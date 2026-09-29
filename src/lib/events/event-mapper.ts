import { CalendarEvent } from '@/shared/types/event'
import { parseIsoToZonedDateTime } from '@/shared/utils/event-date-time/event-date-time'
import { getCalendarIdByColor } from './calendar-config'

export const mapEventToScheduleX = (event: CalendarEvent) => {
	return {
		id: event.$id,
		title: event.title,
		description: event.description,
		start: parseIsoToZonedDateTime(event.startDate),
		end: parseIsoToZonedDateTime(event.endDate),
		color: event.color,
		calendarId: getCalendarIdByColor(event.color),
		source: event.source ?? 'local',
		googleEventId: event.googleEventId,
		recurrenceRule: event.recurrenceRule,
		recurrenceExDates: event.recurrenceExDates,
		_masterEventId: event._masterEventId,
		_isRecurrenceInstance: event._isRecurrenceInstance,
		_instanceDate: event._instanceDate,
	}
}
