import { RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import { parseIsoToZonedDateTime } from '@/shared/utils/event-date-time/event-date-time'
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

export const configToRRule = (config: RecurrenceConfig, startDateIso: string): string => {
	if (config.frequency === 'none') return ''

	const isAllDay = !startDateIso.includes('T') && startDateIso.length <= 10

	let localYear: number
	let localMonth: number
	let localDay: number
	let localHour: number
	let localMinute: number
	let localSecond: number
	let localDayOfWeekIndex = 0

	if (isAllDay) {
		const pDate = Temporal.PlainDate.from(startDateIso)
		localYear = pDate.year
		localMonth = pDate.month
		localDay = pDate.day
		localHour = 0
		localMinute = 0
		localSecond = 0
		localDayOfWeekIndex = (pDate.dayOfWeek - 1 + 7) % 7
	} else {
		const zdt = parseIsoToZonedDateTime(startDateIso)
		if ('hour' in zdt) {
			localYear = zdt.year
			localMonth = zdt.month
			localDay = zdt.day
			localHour = zdt.hour
			localMinute = zdt.minute
			localSecond = zdt.second
			localDayOfWeekIndex = (zdt.dayOfWeek - 1 + 7) % 7
		} else {
			localYear = zdt.year
			localMonth = zdt.month
			localDay = zdt.day
			localHour = 0
			localMinute = 0
			localSecond = 0
			localDayOfWeekIndex = (zdt.dayOfWeek - 1 + 7) % 7
		}
	}

	const dtstart = new Date(Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, localSecond))
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
			if (config.weekDays && config.weekDays.length > 0) {
				byweekday = config.weekDays.map(d => WEEKDAY_MAP[d]).filter(Boolean)
			} else {
				const targetWeekday = WEEKDAY_MAP[localDayOfWeekIndex] || RRule.MO
				byweekday = [targetWeekday]
			}
			break
		}
		case 'monthly':
			freq = RRule.MONTHLY
			break
		case 'yearly':
			freq = RRule.YEARLY
			break
	}

	let until: Date | undefined
	if (config.endType === 'until' && config.endDate) {
		const endStr = config.endDate.length <= 10 ? `${config.endDate}T23:59:59.999Z` : config.endDate
		until = new Date(endStr)
	}
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

		let isCustom = false

		if (opts.freq === RRule.YEARLY && interval === 1 && !opts.until && !opts.count) {
			frequency = 'yearly'
		} else if (opts.freq === RRule.DAILY && interval === 1 && !opts.until && !opts.count) {
			frequency = 'daily'
		} else if (
			opts.freq === RRule.WEEKLY &&
			interval === 1 &&
			weekDays &&
			weekDays.length === 5 &&
			[0, 1, 2, 3, 4].every(d => weekDays?.includes(d)) &&
			!opts.until &&
			!opts.count
		) {
			frequency = 'weekdays'
		} else if (
			opts.freq === RRule.WEEKLY &&
			interval === 1 &&
			weekDays &&
			weekDays.length === 1 &&
			!opts.until &&
			!opts.count
		) {
			frequency = 'weekly'
		} else if (opts.freq === RRule.MONTHLY && interval === 1 && !opts.until && !opts.count) {
			frequency = 'monthly'
		} else {
			if (opts.freq === RRule.DAILY) frequency = 'daily'
			else if (opts.freq === RRule.WEEKLY) frequency = 'weekly'
			else if (opts.freq === RRule.MONTHLY) frequency = 'monthly'
			else if (opts.freq === RRule.YEARLY) frequency = 'yearly'
			isCustom = true
		}

		let endType: 'never' | 'until' | 'count' = 'never'
		let endDate: string | undefined
		let count: number | undefined

		if (opts.until) {
			endType = 'until'
			endDate = opts.until.toISOString().slice(0, 10)
			isCustom = true
		} else if (opts.count) {
			endType = 'count'
			count = opts.count
			isCustom = true
		}

		if (interval > 1) {
			isCustom = true
		}

		return {
			frequency,
			interval,
			weekDays,
			endType,
			endDate,
			count,
			isCustom,
		}
	} catch {
		return {
			frequency: 'daily',
			interval: 1,
			endType: 'never',
		}
	}
}

export const getRecurrenceConfigSummary = (config: RecurrenceConfig): string => {
	if (config.frequency === 'none') return 'Does not repeat'

	let base = ''

	switch (config.frequency) {
		case 'daily':
			base = config.interval > 1 ? `Every ${config.interval} days` : 'Daily'
			break
		case 'weekdays':
			base = 'Every weekday (Mon–Fri)'
			break
		case 'weekly': {
			if (config.weekDays && config.weekDays.length > 0) {
				const dayNames = config.weekDays.map(d => DAY_SHORT_NAMES[d]).join(', ')
				base = config.interval > 1 ? `Every ${config.interval} weeks on ${dayNames}` : `Weekly on ${dayNames}`
			} else {
				base = config.interval > 1 ? `Every ${config.interval} weeks` : 'Weekly'
			}
			break
		}
		case 'monthly':
			base = config.interval > 1 ? `Every ${config.interval} months` : 'Monthly'
			break
		case 'yearly':
			base = config.interval > 1 ? `Every ${config.interval} years` : 'Annually'
			break
		default:
			base = 'Repeats'
			break
	}

	if (config.endType === 'until' && config.endDate) {
		base += `, until ${config.endDate}`
	} else if (config.endType === 'count' && config.count) {
		base += `, ${config.count} times`
	}

	return base
}

export const getRecurrenceSummary = (rruleStr?: string): string => {
	if (!rruleStr) return 'Does not repeat'

	try {
		const config = rruleToConfig(rruleStr)
		return getRecurrenceConfigSummary(config)
	} catch {
		return 'Repeats'
	}
}
