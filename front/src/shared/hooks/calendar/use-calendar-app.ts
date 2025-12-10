import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { useState } from 'react'

export const useCalendarApp = () => {
	const [eventsService] = useState(() => createEventsServicePlugin())

	const calendar = useNextCalendarApp({
		views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
		defaultView: 'week',
		events: [],
		plugins: [eventsService],
		callbacks: {},
		calendars: CALENDARS_CONFIG,
	})

	return { calendar, eventsService }
}
