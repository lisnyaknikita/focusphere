import { TimeFormat, useSettingsStore } from '@/shared/stores/settings.store'
import { formatTime } from '@/shared/utils/format-time/format-time'

type DateLike = string | { toString(): string }

export const formatDateRange = (start: DateLike, end: DateLike, timeFormat?: TimeFormat): string => {
	const startStr = typeof start === 'string' ? start : start.toString()
	const endStr = typeof end === 'string' ? end : end.toString()

	const cleanStart = startStr.replace(/\[.*?\]$/, '')
	const cleanEnd = endStr.replace(/\[.*?\]$/, '')

	const startDate = new Date(cleanStart)
	const endDate = new Date(cleanEnd)

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	const format = timeFormat || useSettingsStore.getState().timeFormat
	const month = months[startDate.getMonth()]
	const day = startDate.getDate()
	const year = startDate.getFullYear()
	const startTime = formatTime(startDate, format)
	const endTime = formatTime(endDate, format)

	return `${month} ${day}, ${year} ⋅ ${startTime} – ${endTime}`
}
