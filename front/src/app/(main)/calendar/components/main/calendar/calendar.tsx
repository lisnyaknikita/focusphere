import { CalendarEvent } from '@/shared/types/event'
import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'

import { useEffect, useState } from 'react'
import { CalendarView } from '../../../page'

interface CalendarInnerProps {
	currentView: CalendarView
	events: CalendarEvent[]
	onViewChange: (newView: CalendarView) => void
}

const mapEventToScheduleX = (event: CalendarEvent) => {
	const toZDT = (iso: string) => Temporal.Instant.from(iso).toZonedDateTimeISO('UTC')

	return {
		id: event.$id,
		title: event.title,
		start: toZDT(event.startDate),
		end: toZDT(event.endDate),
		color: event.color,
	}
}

export const CalendarInner = ({ currentView, events, onViewChange }: CalendarInnerProps) => {
	const [eventsService] = useState(() => createEventsServicePlugin())

	const calendar = useNextCalendarApp({
		views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
		defaultView: 'month',
		events: [],
		plugins: [eventsService],
		callbacks: {},
	})

	useEffect(() => {
		eventsService.set(events.map(mapEventToScheduleX))
	}, [events, eventsService])

	return <ScheduleXCalendar calendarApp={calendar} />
}
