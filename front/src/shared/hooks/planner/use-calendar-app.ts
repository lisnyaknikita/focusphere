import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { useState } from 'react'

export const useCalendarApp = () => {
	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())

	const calendar = useNextCalendarApp({
		views: [createViewWeek()],
		defaultView: 'week',
		events: [],
		plugins: [eventsService, calendarControls, createCurrentTimePlugin(), eventModal],
		callbacks: {},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	return { calendar, eventsService, eventModal }
}
