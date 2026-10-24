import { RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import 'temporal-polyfill/global'

export const getDayOfWeekIndex = (dateStr?: string): number => {
	if (!dateStr) return 0
	try {
		const str = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
		const plainDate = Temporal.PlainDate.from(str)
		return (plainDate.dayOfWeek - 1 + 7) % 7
	} catch {
		return 0
	}
}

export const getDayOfWeekName = (dateStr?: string): string => {
	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const idx = getDayOfWeekIndex(dateStr)
	return dayNames[idx] || 'day'
}

export const getDefaultRecurrenceConfig = (frequency: RecurrenceFrequency, dateStr?: string): RecurrenceConfig => {
	const currentDayIndex = getDayOfWeekIndex(dateStr)

	switch (frequency) {
		case 'none':
			return { frequency: 'none', interval: 1, endType: 'never' }
		case 'daily':
			return { frequency: 'daily', interval: 1, endType: 'never' }
		case 'weekdays':
			return { frequency: 'weekdays', interval: 1, weekDays: [0, 1, 2, 3, 4], endType: 'never' }
		case 'weekly':
			return { frequency: 'weekly', interval: 1, weekDays: [currentDayIndex], endType: 'never' }
		case 'monthly':
			return { frequency: 'monthly', interval: 1, endType: 'never' }
		case 'yearly':
			return { frequency: 'yearly', interval: 1, endType: 'never' }
		default:
			return { frequency: 'none', interval: 1, endType: 'never' }
	}
}
