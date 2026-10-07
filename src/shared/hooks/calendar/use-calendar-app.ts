import { CalendarView, VIEW_TO_SX } from '@/app/(main)/calendar/constants/calendar.constants'
import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calendar-mutations'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { scheduleXDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { CalendarEvent, createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { createResizePlugin } from '@schedule-x/resize'
import { useEffect, useRef, useState } from 'react'

interface UseCalendarAppProps {
	defaultView: CalendarView
	onQuickCreate?: (dateTime: Temporal.ZonedDateTime) => void
	onDateClick?: (date: Temporal.PlainDate) => void
	onRangeUpdate?: (range: { start: { toString(): string }; end: { toString(): string } }) => void
}

export const useCalendarApp = ({ defaultView, onQuickCreate, onDateClick, onRangeUpdate }: UseCalendarAppProps) => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const { handleUpdateEvent } = useCalendarMutations()

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

				const startDate = scheduleXDateTimeToInstant(start)
				const endDate = scheduleXDateTimeToInstant(end)

				await handleUpdateEvent(
					eventId,
					{
						title: title || 'Untitled event',
						description: description as string | undefined,
						color: color as string | undefined,
						startDate,
						endDate,
					},
					googleEventId,
					'this'
				)
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
	}, [calendar, timeFormat])

	const setView = (view: CalendarView) => {
		calendarControls?.setView(VIEW_TO_SX[view])
	}

	return { calendar, eventsService, setView, eventModal }
}
