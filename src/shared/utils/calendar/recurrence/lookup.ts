import { calendarKeys } from '@/shared/constants/query-keys'
import { CalendarEvent } from '@/shared/types/event'
import {
	addDaysToDateString,
	getUserTimeZone,
	parseIsoToZonedDateTime,
} from '@/shared/utils/event-date-time/event-date-time'
import { QueryClient } from '@tanstack/react-query'
import 'temporal-polyfill/global'

export const getMasterGoogleEventId = (queryClient: QueryClient, masterEventId: string): string | undefined => {
	const recurringQueries = queryClient.getQueriesData<CalendarEvent[]>({
		queryKey: [...calendarKeys.all, 'recurring'],
	})
	for (const [, events] of recurringQueries) {
		if (Array.isArray(events)) {
			const found = events.find(e => e.$id === masterEventId)
			if (found?.googleEventId) return found.googleEventId
		}
	}

	const localQueries = queryClient.getQueriesData<CalendarEvent[]>({
		queryKey: calendarKeys.localMonths(),
	})
	for (const [, events] of localQueries) {
		if (Array.isArray(events)) {
			const found = events.find(e => e.$id === masterEventId)
			if (found?.googleEventId) return found.googleEventId
		}
	}

	return undefined
}

export const getMasterEvent = (queryClient: QueryClient, masterEventId: string): CalendarEvent | undefined => {
	const recurringQueries = queryClient.getQueriesData<CalendarEvent[]>({
		queryKey: [...calendarKeys.all, 'recurring'],
	})
	for (const [, events] of recurringQueries) {
		if (Array.isArray(events)) {
			const found = events.find(e => e.$id === masterEventId)
			if (found) return found
		}
	}

	const localQueries = queryClient.getQueriesData<CalendarEvent[]>({
		queryKey: calendarKeys.localMonths(),
	})
	for (const [, events] of localQueries) {
		if (Array.isArray(events)) {
			const found = events.find(e => e.$id === masterEventId)
			if (found) return found
		}
	}

	return undefined
}

export const adjustMasterDatesForSeriesUpdate = (
	master: CalendarEvent,
	instanceDate: string,
	newInstanceStartIso: string,
	newInstanceEndIso: string
): { startDate: string; endDate: string } => {
	try {
		const isAllDay = !newInstanceStartIso.includes('T') && newInstanceStartIso.length <= 10

		if (isAllDay) {
			const instancePDate = Temporal.PlainDate.from(instanceDate)
			const newStartPDate = Temporal.PlainDate.from(newInstanceStartIso)
			const dayShift = newStartPDate.since(instancePDate).total({ unit: 'days' })

			const masterPDate = Temporal.PlainDate.from(master.startDate)
			const adjustedMasterStartDate = masterPDate.add({ days: dayShift }).toString()

			let durationDays = 0
			if (newInstanceEndIso && newInstanceEndIso.length <= 10) {
				const newEndPDate = Temporal.PlainDate.from(newInstanceEndIso)
				durationDays = newEndPDate.since(newStartPDate).total({ unit: 'days' })
			}
			const adjustedMasterEndDate =
				durationDays > 0
					? addDaysToDateString(adjustedMasterStartDate, Math.round(durationDays))
					: adjustedMasterStartDate

			return { startDate: adjustedMasterStartDate, endDate: adjustedMasterEndDate }
		}

		const timeZone = getUserTimeZone()
		const newStartZdt = parseIsoToZonedDateTime(newInstanceStartIso)
		const newDateStr =
			'toPlainDate' in newStartZdt ? newStartZdt.toPlainDate().toString() : newStartZdt.toString().slice(0, 10)

		const instancePDate = Temporal.PlainDate.from(instanceDate)
		const newStartPDate = Temporal.PlainDate.from(newDateStr)
		const dayShift = newStartPDate.since(instancePDate).total({ unit: 'days' })

		const masterStartZdt = parseIsoToZonedDateTime(master.startDate)
		const masterStartPDate =
			'toPlainDate' in masterStartZdt
				? masterStartZdt.toPlainDate()
				: Temporal.PlainDate.from(master.startDate.slice(0, 10))
		const adjustedMasterStartPDate = masterStartPDate.add({ days: dayShift })

		const hour = 'hour' in newStartZdt ? newStartZdt.hour : new Date(newInstanceStartIso).getHours()
		const minute = 'minute' in newStartZdt ? newStartZdt.minute : new Date(newInstanceStartIso).getMinutes()
		const second = 'second' in newStartZdt ? newStartZdt.second : 0

		const adjustedMasterStartZdt = Temporal.PlainDateTime.from({
			year: adjustedMasterStartPDate.year,
			month: adjustedMasterStartPDate.month,
			day: adjustedMasterStartPDate.day,
			hour,
			minute,
			second,
		}).toZonedDateTime(timeZone)

		const durationMs = new Date(newInstanceEndIso).getTime() - new Date(newInstanceStartIso).getTime()
		const adjustedMasterStartInstant = adjustedMasterStartZdt.toInstant()
		const adjustedMasterEndInstant = Temporal.Instant.fromEpochMilliseconds(
			adjustedMasterStartInstant.epochMilliseconds + durationMs
		)

		return {
			startDate: adjustedMasterStartInstant.toString(),
			endDate: adjustedMasterEndInstant.toString(),
		}
	} catch (error) {
		console.error('Failed to adjust master dates for series update:', error)
		return { startDate: newInstanceStartIso, endDate: newInstanceEndIso }
	}
}
