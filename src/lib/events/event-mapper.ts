import { CalendarEvent } from '@/shared/types/event'
import { TimeBlock } from '@/shared/types/time-block'
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

export const mapTimeBlockToScheduleX = (timeBlock: TimeBlock) => {
	const toZDT = (iso: string) => Temporal.Instant.from(iso).toZonedDateTimeISO('UTC')

	return {
		id: timeBlock.$id,
		title: timeBlock.title,
		start: toZDT(timeBlock.startDate),
		end: toZDT(timeBlock.endDate),
		color: timeBlock.color,
		calendarId: getCalendarIdByColor(timeBlock.color),
	}
}
