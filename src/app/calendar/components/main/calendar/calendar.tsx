import { CalendarView } from '@/app/calendar/page'
import { DayView } from './views/day/day'
import { MonthView } from './views/month/month'
import { WeekView } from './views/week/week'

interface CalendarInnerProps {
	view: CalendarView
}

export const CalendarInner = ({ view }: CalendarInnerProps) => {
	switch (view) {
		case 'month':
			return <MonthView />
		case 'day':
			return <DayView />
		default:
			return <WeekView />
	}
}
