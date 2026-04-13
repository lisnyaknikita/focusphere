import { CalendarView, VIEW_TO_SX } from '@/app/(main)/calendar/constants/calendar.constants'
import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { updateEvent } from '@/lib/events/events'
import { CalendarEvent, createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { createResizePlugin } from '@schedule-x/resize'
import { useState } from 'react'

interface UseCalendarAppProps {
	defaultView: CalendarView
}

export const useCalendarApp = ({ defaultView }: UseCalendarAppProps) => {
	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())
	const [dragAndDropPlugin] = useState(() => createDragAndDropPlugin())
	const [resizePlugin] = useState(() => createResizePlugin(15))

	const calendar = useNextCalendarApp({
		views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
		defaultView: VIEW_TO_SX[defaultView],
		events: [],
		plugins: [eventsService, calendarControls, dragAndDropPlugin, resizePlugin, createCurrentTimePlugin(), eventModal],
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

					if (eventId.startsWith('g_')) {
						const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
						await googleCalendarService.updateEvent(eventId, {
							summary: title,
							description: description as string | undefined,
							color: color as string | undefined,
							start: startDate,
							end: endDate,
						})
					} else {
						await updateEvent(eventId, {
							startDate,
							endDate,
						})
					}
				} catch (error) {
					console.error('Event update failed:', error)
				}
			},
		},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	const setView = (view: CalendarView) => {
		calendarControls?.setView(VIEW_TO_SX[view])
	}

	return { calendar, eventsService, setView, eventModal }
}
