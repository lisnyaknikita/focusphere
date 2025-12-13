import { CalendarEvent } from '@/shared/types/event'
import { getCalendarIdByColor } from './calendar-config'

export const mapEventToScheduleX = (event: CalendarEvent) => {
	const toZDT = (iso: string) => Temporal.Instant.from(iso).toZonedDateTimeISO('UTC')

	return {
		id: event.$id,
		title: event.title,
		description: event.description,
		start: toZDT(event.startDate),
		end: toZDT(event.endDate),
		color: event.color,
		calendarId: getCalendarIdByColor(event.color),
	}
}
