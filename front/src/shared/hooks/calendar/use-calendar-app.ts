import { CalendarView, VIEW_TO_SX } from '@/app/(main)/calendar/page'
import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { useState } from 'react'

interface UseCalendarAppProps {
	defaultView: CalendarView
}

export const useCalendarApp = ({ defaultView }: UseCalendarAppProps) => {
	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())

	const calendar = useNextCalendarApp({
		views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
		defaultView: VIEW_TO_SX[defaultView],
		events: [],
		plugins: [eventsService, calendarControls, createCurrentTimePlugin(), eventModal],
		callbacks: {},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	const setView = (view: CalendarView) => {
		calendarControls?.setView(VIEW_TO_SX[view])
	}

	return { calendar, eventsService, setView, eventModal }
}
