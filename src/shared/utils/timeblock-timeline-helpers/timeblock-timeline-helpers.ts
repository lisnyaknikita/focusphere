import { TimeFormat, useSettingsStore } from '@/shared/stores/settings.store'
import { formatTime } from '@/shared/utils/format-time/format-time'

type BlockStatus = 'past' | 'current' | 'upcoming'

export const getBlockStatus = (startDateStr: string, endDateStr: string): BlockStatus => {
	const now = new Date()
	const start = new Date(startDateStr)
	const end = new Date(endDateStr)

	if (now > end) return 'past'
	if (now >= start && now <= end) return 'current'
	return 'upcoming'
}

export const formatTimeRange = (startStr: string, endStr: string, timeFormat?: TimeFormat) => {
	const format = timeFormat || useSettingsStore.getState().timeFormat
	const start = formatTime(startStr, format)
	const end = formatTime(endStr, format)
	return `${start} – ${end}`
}
