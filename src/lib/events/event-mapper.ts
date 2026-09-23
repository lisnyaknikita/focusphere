import { CalendarEvent } from '@/shared/types/event'
import { getCalendarIdByColor } from './calendar-config'

export const mapEventToScheduleX = (event: CalendarEvent) => {
	const toZDT = (iso: string) => {
		if (!iso.includes('T') && iso.length <= 10) return Temporal.PlainDate.from(iso)

		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

		const hasTimeZoneOffset = iso.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(iso)

		if (!hasTimeZoneOffset) {
			return Temporal.PlainDateTime.from(iso).toZonedDateTime(timeZone)
		}

		return Temporal.Instant.from(iso).toZonedDateTimeISO(timeZone)
	}

	return {
		id: event.$id,
		title: event.title,
		description: event.description,
		start: toZDT(event.startDate),
		end: toZDT(event.endDate),
		color: event.color,
		calendarId: getCalendarIdByColor(event.color),
		source: event.source ?? 'local',
		googleEventId: event.googleEventId,
	}
}
