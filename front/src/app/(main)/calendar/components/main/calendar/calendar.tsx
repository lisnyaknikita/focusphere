import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { CalendarEvent } from '@/shared/types/event'
import { ScheduleXCalendar } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'

import { useEffect } from 'react'

interface CalendarInnerProps {
	events: CalendarEvent[]
}

export const CalendarInner = ({ events }: CalendarInnerProps) => {
	const { calendar, eventsService } = useCalendarApp()

	useEffect(() => {
		eventsService.set(events.map(mapEventToScheduleX))
	}, [events, eventsService])

	return <ScheduleXCalendar calendarApp={calendar} />
}
