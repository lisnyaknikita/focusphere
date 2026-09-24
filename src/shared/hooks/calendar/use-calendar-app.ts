import { CalendarView, VIEW_TO_SX } from '@/app/(main)/calendar/constants/calendar.constants'
import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { updateEvent } from '@/lib/events/events'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { isRecurrenceInstanceId, parseRecurrenceInstanceId } from '@/shared/utils/calendar/recurrence'
import { scheduleXDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { CalendarEvent, createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { createResizePlugin } from '@schedule-x/resize'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

interface UseCalendarAppProps {
	defaultView: CalendarView
	onQuickCreate?: (dateTime: Temporal.ZonedDateTime) => void
	onDateClick?: (date: Temporal.PlainDate) => void
	onRangeUpdate?: (range: { start: { toString(): string }; end: { toString(): string } }) => void
}

export const useCalendarApp = ({ defaultView, onQuickCreate, onDateClick, onRangeUpdate }: UseCalendarAppProps) => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const queryClient = useQueryClient()

	const onQuickCreateRef = useRef(onQuickCreate)
	onQuickCreateRef.current = onQuickCreate
	const onDateClickRef = useRef(onDateClick)
	onDateClickRef.current = onDateClick
	const onRangeUpdateRef = useRef(onRangeUpdate)
	onRangeUpdateRef.current = onRangeUpdate

	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())
	const [dragAndDropPlugin] = useState(() => createDragAndDropPlugin())
	const [resizePlugin] = useState(() => createResizePlugin(15))

	const calendar = useNextCalendarApp({
		locale: timeFormat === '12h' ? 'en-US' : 'en-GB',
		views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
		defaultView: VIEW_TO_SX[defaultView],
		monthGridOptions: {
			nEventsPerDay: 3,
		},
		weekOptions: {
			gridHeight: 1032,
			timeAxisFormatOptions:
				timeFormat === '12h' ? { hour: 'numeric' } : { hour: '2-digit', minute: '2-digit', hour12: false },
		},
		events: [],
		plugins: [eventsService, calendarControls, dragAndDropPlugin, resizePlugin, createCurrentTimePlugin(), eventModal],
		callbacks: {
			onRangeUpdate(range) {
				onRangeUpdateRef.current?.(range)
			},
			onClickDateTime(dateTime) {
				onQuickCreateRef.current?.(dateTime)
			},
			onClickDate(date) {
				onDateClickRef.current?.(date)
			},
			async onEventUpdate(updatedEvent: CalendarEvent) {
				const { id, start, end, title, description, color } = updatedEvent
				const eventId = String(id)
				const googleEventId = (updatedEvent as unknown as { googleEventId?: string }).googleEventId
				const isGoogleLinked = eventId.startsWith('g_') || Boolean(googleEventId)

				const startDate = scheduleXDateTimeToInstant(start)
				const endDate = scheduleXDateTimeToInstant(end)

				const updateQueryData = (oldData: unknown) => {
					if (!Array.isArray(oldData)) return oldData
					return oldData.map((item: { $id?: string; id?: string; [key: string]: unknown }) => {
						if (String(item.$id || item.id) === eventId) {
							return {
								...item,
								startDate,
								endDate,
							}
						}
						return item
					})
				}

				queryClient.setQueriesData({ queryKey: ['calendar-events-month'] }, updateQueryData)
				queryClient.setQueriesData({ queryKey: ['calendar-google-events-month'] }, updateQueryData)
				queryClient.setQueriesData({ queryKey: ['calendar-events'] }, updateQueryData)

				try {
					if (isRecurrenceInstanceId(eventId)) {
						const parsed = parseRecurrenceInstanceId(eventId)
						if (parsed) {
							const { addRecurrenceException, createEvent } = await import('@/lib/events/events')
							const { getCurrentUserId } = await import('@/shared/utils/get-current-userid/get-current-userid')
							const { getCalendarIdByColor } = await import('@/lib/events/color-to-calendar')

							await addRecurrenceException(parsed.masterEventId, parsed.instanceDate)
							const userId = await getCurrentUserId()
							await createEvent({
								title: title || 'Untitled event',
								description: description as string | undefined,
								color: (color as string) || '#D79716',
								startDate,
								endDate,
								calendarId: getCalendarIdByColor((color as string) || '#D79716'),
								userId,
								source: 'local',
								syncStatus: 'not_synced',
							})
							await Promise.all([
								queryClient.invalidateQueries({ queryKey: ['calendar-events-month'] }),
								queryClient.invalidateQueries({ queryKey: ['calendar-recurring-events'] }),
							])
							return
						}
					}

					if (isGoogleLinked) {
						const { googleCalendarService } = await import('@/shared/services/google-calendar.service')

						await googleCalendarService.updateEvent(googleEventId || eventId, {
							summary: title,
							description: description as string | undefined,
							color: color as string | undefined,
							start: startDate,
							end: endDate,
						})
					}
					if (!eventId.startsWith('g_')) {
						await updateEvent(eventId, {
							startDate,
							endDate,
						})
					}
				} catch (error) {
					console.error('Event update failed:', error)
					queryClient.invalidateQueries({ queryKey: ['calendar-events-month'] })
					queryClient.invalidateQueries({ queryKey: ['calendar-google-events-month'] })
					queryClient.invalidateQueries({ queryKey: ['calendar-recurring-events'] })
					queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
					queryClient.invalidateQueries({ queryKey: ['calendar-google-events'] })
				}
			},
		},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const calendarApp = (calendar as any)?._app
		if (!calendarApp) return
		const is12h = timeFormat === '12h'
		calendarApp.config.locale.value = is12h ? 'en-US' : 'en-GB'
		calendarApp.config.weekOptions.value = {
			...calendarApp.config.weekOptions.value,
			eventOverlap: false,
			timeAxisFormatOptions: is12h ? { hour: 'numeric' } : { hour: '2-digit', minute: '2-digit', hour12: false },
		}

		const handleResize = () => {
			if (typeof window === 'undefined') return
			const targetCount = window.innerWidth <= 768 ? 2 : 3
			if (calendarApp.config.monthGridOptions?.value?.nEventsPerDay !== targetCount) {
				calendarApp.config.monthGridOptions.value = {
					...calendarApp.config.monthGridOptions.value,
					nEventsPerDay: targetCount,
				}
			}
		}

		handleResize()
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [calendar, timeFormat])

	const setView = (view: CalendarView) => {
		calendarControls?.setView(VIEW_TO_SX[view])
	}

	return { calendar, eventsService, setView, eventModal }
}
