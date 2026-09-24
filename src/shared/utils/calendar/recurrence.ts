import { CalendarEvent, RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import { RRule, Weekday, rrulestr } from 'rrule'
import 'temporal-polyfill/global'

const WEEKDAY_MAP: Record<number, Weekday> = {
	0: RRule.MO,
	1: RRule.TU,
	2: RRule.WE,
	3: RRule.TH,
	4: RRule.FR,
	5: RRule.SA,
	6: RRule.SU,
}

const DAY_SHORT_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const isRecurringEvent = (event: { recurrenceRule?: string; _isRecurrenceInstance?: boolean }): boolean => {
	return Boolean(event.recurrenceRule || event._isRecurrenceInstance)
}

export const isRecurrenceInstanceId = (id: string | number): boolean => {
	return String(id).includes('__recur__')
}

export const parseRecurrenceInstanceId = (
	id: string | number
): { masterEventId: string; instanceDate: string } | null => {
	const str = String(id)
	const parts = str.split('__recur__')
	if (parts.length === 2) {
		return { masterEventId: parts[0], instanceDate: parts[1] }
	}
	return null
}

export const configToRRule = (config: RecurrenceConfig, startDateIso: string): string => {
	if (config.frequency === 'none') return ''

	const dtstart = new Date(startDateIso)
	const interval = Math.max(1, config.interval || 1)

	let freq: number = RRule.DAILY
	let byweekday: Weekday[] | undefined

	switch (config.frequency) {
		case 'daily':
			freq = RRule.DAILY
			break
		case 'weekdays':
			freq = RRule.WEEKLY
			byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
			break
		case 'weekly': {
			freq = RRule.WEEKLY
			const jsDay = dtstart.getDay()
			const rruleDayIndex = (jsDay + 6) % 7
			const targetWeekday = WEEKDAY_MAP[rruleDayIndex] || RRule.MO
			byweekday = [targetWeekday]
			break
		}
		case 'monthly':
			freq = RRule.MONTHLY
			break
	}

	const until = config.endType === 'until' && config.endDate ? new Date(config.endDate) : undefined
	const count = config.endType === 'count' && config.count ? config.count : undefined

	const rule = new RRule({
		freq,
		interval,
		byweekday,
		dtstart,
		until,
		count,
	})

	const fullRule = rule.toString()
	const rruleLine = fullRule.split('\n').find(line => line.startsWith('RRULE:'))
	return rruleLine ? rruleLine.replace(/^RRULE:/, '') : fullRule
}

export const rruleToConfig = (rruleStr?: string): RecurrenceConfig => {
	if (!rruleStr || !rruleStr.trim()) {
		return {
			frequency: 'none',
			interval: 1,
			endType: 'never',
		}
	}

	try {
		const rule = rrulestr(rruleStr.startsWith('RRULE:') ? rruleStr : `RRULE:${rruleStr}`)
		const opts = rule.options

		let frequency: RecurrenceFrequency = 'daily'
		const interval = opts.interval || 1
		let weekDays: number[] | undefined

		if (opts.byweekday && Array.isArray(opts.byweekday)) {
			weekDays = opts.byweekday.map((w: unknown) => (typeof w === 'number' ? w : (w as { weekday: number }).weekday))
		}

		if (opts.freq === RRule.DAILY && interval === 1 && !opts.until && !opts.count) {
			frequency = 'daily'
		} else if (
			opts.freq === RRule.WEEKLY &&
			interval === 1 &&
			weekDays &&
			weekDays.length === 5 &&
			[0, 1, 2, 3, 4].every(d => weekDays?.includes(d))
		) {
			frequency = 'weekdays'
		} else if (opts.freq === RRule.WEEKLY && interval === 1 && weekDays && weekDays.length === 1) {
			frequency = 'weekly'
		} else if (opts.freq === RRule.MONTHLY && interval === 1 && !opts.until && !opts.count) {
			frequency = 'monthly'
		} else {
			frequency = 'daily'
		}

		let endType: 'never' | 'until' | 'count' = 'never'
		let endDate: string | undefined
		let count: number | undefined

		if (opts.until) {
			endType = 'until'
			endDate = opts.until.toISOString().slice(0, 10)
		} else if (opts.count) {
			endType = 'count'
			count = opts.count
		}

		return {
			frequency,
			interval,
			weekDays,
			endType,
			endDate,
			count,
		}
	} catch {
		return {
			frequency: 'daily',
			interval: 1,
			endType: 'never',
		}
	}
}

export const expandRecurrence = (event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] => {
	if (!event.recurrenceRule || !event.recurrenceRule.trim()) {
		return [event]
	}

	try {
		const startDt = new Date(event.startDate)
		const endDt = new Date(event.endDate)
		const durationMs = endDt.getTime() - startDt.getTime()

		const rruleInput = event.recurrenceRule.startsWith('RRULE:')
			? event.recurrenceRule
			: `RRULE:${event.recurrenceRule}`
		const rule = rrulestr(rruleInput, { dtstart: startDt })

		const occurrences = rule.between(rangeStart, rangeEnd, true)

		const exDateSet = new Set((event.recurrenceExDates || []).map(d => (d.length > 10 ? d.slice(0, 10) : d)))

		const instances: CalendarEvent[] = []

		for (const occ of occurrences) {
			const occDateStr = occ.toISOString().slice(0, 10)

			if (exDateSet.has(occDateStr)) {
				continue
			}

			const occStart = new Date(occ.getTime())
			const occEnd = new Date(occStart.getTime() + durationMs)

			instances.push({
				...event,
				$id: `${event.$id}__recur__${occDateStr}`,
				startDate: occStart.toISOString(),
				endDate: occEnd.toISOString(),
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

export const getRecurrenceSummary = (rruleStr?: string): string => {
	if (!rruleStr) return 'Does not repeat'

	try {
		const config = rruleToConfig(rruleStr)
		switch (config.frequency) {
			case 'daily':
				return config.interval > 1 ? `Every ${config.interval} days` : 'Daily'
			case 'weekdays':
				return 'Every weekday (Mon–Fri)'
			case 'weekly': {
				if (config.weekDays && config.weekDays.length > 0) {
					const dayNames = config.weekDays.map(d => DAY_SHORT_NAMES[d]).join(', ')
					return config.interval > 1 ? `Every ${config.interval} weeks on ${dayNames}` : `Weekly on ${dayNames}`
				}
				return config.interval > 1 ? `Every ${config.interval} weeks` : 'Weekly'
			}
			case 'monthly':
				return config.interval > 1 ? `Every ${config.interval} months` : 'Monthly'
			default:
				return 'Repeats'
		}
	} catch {
		return 'Repeats'
	}
}
