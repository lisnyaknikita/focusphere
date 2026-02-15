import { CalendarEvent as SXEvent } from '@schedule-x/calendar'

export type TemporalLike = SXEvent['start']

export const isZonedDateTime = (value: TemporalLike): value is Temporal.ZonedDateTime => {
	return 'toInstant' in value && typeof value.toInstant === 'function'
}

export const toJSDate = (value: TemporalLike): Date => {
	if (isZonedDateTime(value)) {
		return new Date(value.toInstant().epochMilliseconds)
	}

	return new Date(value.year, value.month - 1, value.day)
}

export const formatDate = (date: Date): string => date.toLocaleDateString('en-CA')

export const formatTime = (date: Date): string => date.toTimeString().slice(0, 5)
