import { CalendarEvent } from '@/shared/types/event'
import {
	addDaysToDateString,
	getUserTimeZone,
	parseIsoToZonedDateTime,
} from '@/shared/utils/event-date-time/event-date-time'
import { rrulestr } from 'rrule'
import 'temporal-polyfill/global'

export const expandRecurrence = (event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] => {
	if (!event.recurrenceRule || !event.recurrenceRule.trim()) {
		return [event]
	}

	try {
		const timeZone = getUserTimeZone()
		const isAllDay = !event.startDate.includes('T') && event.startDate.length <= 10

		let localYear: number
		let localMonth: number
		let localDay: number
		let localHour: number
		let localMinute: number
		let localSecond: number
		let durationMs = 0
		let durationDays = 0

		if (isAllDay) {
			const pDate = Temporal.PlainDate.from(event.startDate)
			localYear = pDate.year
			localMonth = pDate.month
			localDay = pDate.day
			localHour = 0
			localMinute = 0
			localSecond = 0
			if (event.endDate && event.endDate.length <= 10) {
				const pEnd = Temporal.PlainDate.from(event.endDate)
				durationDays = pEnd.since(pDate).total({ unit: 'days' })
			}
		} else {
			const startZdt = parseIsoToZonedDateTime(event.startDate)
			if ('hour' in startZdt) {
				localYear = startZdt.year
				localMonth = startZdt.month
				localDay = startZdt.day
				localHour = startZdt.hour
				localMinute = startZdt.minute
				localSecond = startZdt.second
			} else {
				localYear = startZdt.year
				localMonth = startZdt.month
				localDay = startZdt.day
				localHour = 0
				localMinute = 0
				localSecond = 0
			}

			if (event.endDate) {
				const endZdt = parseIsoToZonedDateTime(event.endDate)
				if ('epochMilliseconds' in endZdt && 'epochMilliseconds' in startZdt) {
					durationMs = endZdt.epochMilliseconds - startZdt.epochMilliseconds
				} else {
					durationMs = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
				}
			}
		}

		const fakeDtstart = new Date(Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, localSecond))

		const rangeStartZdt = parseIsoToZonedDateTime(rangeStart.toISOString())
		const rangeEndZdt = parseIsoToZonedDateTime(rangeEnd.toISOString())

		const rangeStartYear = 'year' in rangeStartZdt ? rangeStartZdt.year : rangeStart.getUTCFullYear()
		const rangeStartMonth = 'month' in rangeStartZdt ? rangeStartZdt.month : rangeStart.getUTCMonth() + 1
		const rangeStartDay = 'day' in rangeStartZdt ? rangeStartZdt.day : rangeStart.getUTCDate()

		const rangeEndYear = 'year' in rangeEndZdt ? rangeEndZdt.year : rangeEnd.getUTCFullYear()
		const rangeEndMonth = 'month' in rangeEndZdt ? rangeEndZdt.month : rangeEnd.getUTCMonth() + 1
		const rangeEndDay = 'day' in rangeEndZdt ? rangeEndZdt.day : rangeEnd.getUTCDate()

		const fakeRangeStart = new Date(Date.UTC(rangeStartYear, rangeStartMonth - 1, rangeStartDay, 0, 0, 0, 0))
		const fakeRangeEnd = new Date(Date.UTC(rangeEndYear, rangeEndMonth - 1, rangeEndDay, 23, 59, 59, 999))

		const rruleInput = event.recurrenceRule.startsWith('RRULE:')
			? event.recurrenceRule
			: `RRULE:${event.recurrenceRule}`
		const rule = rrulestr(rruleInput, { dtstart: fakeDtstart })

		const occurrences = rule.between(fakeRangeStart, fakeRangeEnd, true)

		const exDateSet = new Set((event.recurrenceExDates || []).map(d => (d.length > 10 ? d.slice(0, 10) : d)))

		const instances: CalendarEvent[] = []

		for (const occ of occurrences) {
			const occYear = occ.getUTCFullYear()
			const occMonth = occ.getUTCMonth() + 1
			const occDay = occ.getUTCDate()
			const occHour = occ.getUTCHours()
			const occMinute = occ.getUTCMinutes()
			const occSecond = occ.getUTCSeconds()

			const occDateStr = Temporal.PlainDate.from({
				year: occYear,
				month: occMonth,
				day: occDay,
			}).toString()

			if (exDateSet.has(occDateStr)) {
				continue
			}

			let occStartIso: string
			let occEndIso: string

			if (isAllDay) {
				occStartIso = occDateStr
				occEndIso = durationDays > 0 ? addDaysToDateString(occDateStr, Math.round(durationDays)) : occDateStr
			} else {
				const occZdt = Temporal.PlainDateTime.from({
					year: occYear,
					month: occMonth,
					day: occDay,
					hour: occHour,
					minute: occMinute,
					second: occSecond,
				}).toZonedDateTime(timeZone)

				const startInstant = occZdt.toInstant()
				occStartIso = startInstant.toString()
				occEndIso = Temporal.Instant.fromEpochMilliseconds(startInstant.epochMilliseconds + durationMs).toString()
			}

			instances.push({
				...event,
				$id: `${event.$id}__recur__${occDateStr}`,
				startDate: occStartIso,
				endDate: occEndIso,
				_masterEventId: event.$id,
				_isRecurrenceInstance: true,
				_instanceDate: occDateStr,
			})
		}

		return instances
	} catch (error) {
		console.error('Failed to expand recurrence for event:', event.$id, error)
		return [event]
	}
}
