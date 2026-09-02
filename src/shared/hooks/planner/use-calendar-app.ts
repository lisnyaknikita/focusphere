import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { updateTimeBlock } from '@/lib/planner/planner'
import { checkAndResetDragJustCompleted } from '@/shared/hooks/planner/use-grid-drag-create'
import { TimeBlock } from '@/shared/types/time-block'
import { CalendarEvent, createViewDay, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { createResizePlugin } from '@schedule-x/resize'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

interface CalendarAppProps {
	onQuickCreate?: (dateTime: Temporal.ZonedDateTime) => void
}

export const useCalendarApp = ({ onQuickCreate }: CalendarAppProps) => {
	const queryClient = useQueryClient()
	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())
	const [dragAndDropPlugin] = useState(() => createDragAndDropPlugin())
	const [resizePlugin] = useState(() => createResizePlugin(15))

	const quickCreateRef = useRef(onQuickCreate)
	quickCreateRef.current = onQuickCreate

	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
	const defaultView = isMobile ? 'day' : 'week'

	const calendar = useNextCalendarApp({
		views: [createViewWeek(), createViewDay()],
		defaultView,
		weekOptions: {
			gridHeight: 1032,
		},
		events: [],
		plugins: [eventsService, calendarControls, createCurrentTimePlugin(), dragAndDropPlugin, resizePlugin, eventModal],
		callbacks: {
			async onEventUpdate(updatedEvent: CalendarEvent) {
				try {
					const { id, start, end, title, description, color } = updatedEvent
					const eventId = String(id)

					const formatForAppwrite = (dateObj: string | { toString(): string }): string => {
						const text = dateObj.toString().replace(' ', 'T')
						if (text.length <= 10) return text
						const base = text.substring(0, 16)
						return `${base}:00`
					}

					const startDate = formatForAppwrite(start)
					const endDate = formatForAppwrite(end)

					const isGoogle = eventId.startsWith('g_')
					const isCalendarEvent = Boolean(updatedEvent._isCalendarEvent || updatedEvent.title?.startsWith('📅'))

					if (isGoogle) {
						queryClient.setQueryData<CalendarEvent[]>(['events-google'], oldData => {
							if (!oldData) return []
							return oldData.map(item =>
								item.$id === eventId || item.id === eventId ? { ...item, startDate, endDate } : item
							)
						})
					} else if (isCalendarEvent) {
						queryClient.setQueryData<CalendarEvent[]>(['events-appwrite'], oldData => {
							if (!oldData) return []
							return oldData.map(item => (item.$id === eventId ? { ...item, startDate, endDate } : item))
						})
					} else {
						queryClient.setQueryData<TimeBlock[]>(['timeblocks'], oldData => {
							if (!oldData) return []
							return oldData.map(item => (item.$id === eventId ? { ...item, startDate, endDate } : item))
						})
					}

					if (isGoogle) {
						const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
						await googleCalendarService.updateEvent(eventId, {
							summary: title ? title.replace(/^📅\s*/, '') : undefined,
							description: description as string | undefined,
							color: color as string | undefined,
							start: startDate,
							end: endDate,
						})
						queryClient.invalidateQueries({ queryKey: ['events-google'] })
					} else if (isCalendarEvent) {
						const { updateEvent } = await import('@/lib/events/events')
						await updateEvent(eventId, {
							startDate,
							endDate,
						})
						queryClient.invalidateQueries({ queryKey: ['events-appwrite'] })
					} else {
						await updateTimeBlock(eventId, {
							startDate,
							endDate,
						})
						queryClient.invalidateQueries({ queryKey: ['timeblocks'] })
					}
				} catch (error) {
					console.error('Event update failed:', error)
					queryClient.invalidateQueries({ queryKey: ['events-google'] })
					queryClient.invalidateQueries({ queryKey: ['events-appwrite'] })
					queryClient.invalidateQueries({ queryKey: ['timeblocks'] })
				}
			},
			onClickDateTime(dateTime: Temporal.ZonedDateTime) {
				if (checkAndResetDragJustCompleted()) {
					return
				}
				if (quickCreateRef.current) {
					quickCreateRef.current(dateTime)
				}
			},
		},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	useEffect(() => {
		const handleResize = () => {
			const view = window.innerWidth < 768 ? 'day' : 'week'
			calendarControls.setView(view)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [calendarControls])

	return { calendar, eventsService, eventModal }
}
