import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { CalendarEvent } from '@/shared/types/event'
import { ScheduleXCalendar } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'

import { useEffect } from 'react'
import { CalendarView } from '../../../page'

interface CalendarInnerProps {
	events: CalendarEvent[]
	view: CalendarView
}

export const CalendarInner = ({ events, view }: CalendarInnerProps) => {
	const { calendar, eventsService, setView } = useCalendarApp({ defaultView: view })

	useEffect(() => {
		eventsService.set(events.map(mapEventToScheduleX))
	}, [events, eventsService])

	useEffect(() => {
		setView(view)
	}, [view, setView])

	useEffect(() => {
		const timeout = setTimeout(() => {
			const el = document.querySelector('.sx__current-time-indicator')

			if (el) {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, 50)

		return () => clearTimeout(timeout)
	}, [])

	return <ScheduleXCalendar calendarApp={calendar} />
}
