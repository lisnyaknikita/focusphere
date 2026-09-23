import { TimeFormat, useSettingsStore } from '@/shared/stores/settings.store'
import { formatTime } from '@/shared/utils/format-time/format-time'

type DateLike = string | { toString(): string }

export const formatDateRange = (start: DateLike, end: DateLike, timeFormat?: TimeFormat): string => {
	const startStr = typeof start === 'string' ? start : start.toString()
	const endStr = typeof end === 'string' ? end : end.toString()

	const cleanStart = startStr.replace(/\[.*?\]$/, '')
	const cleanEnd = endStr.replace(/\[.*?\]$/, '')

	const isAllDay =
		!cleanStart.includes('T') && cleanStart.length <= 10 && !cleanEnd.includes('T') && cleanEnd.length <= 10

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const format = timeFormat || useSettingsStore.getState().timeFormat

	if (isAllDay) {
		const [sYear, sMonth, sDay] = cleanStart.split('-').map(Number)
		const [eYear, eMonth, eDay] = cleanEnd.split('-').map(Number)

		const startMonthName = months[sMonth - 1]
		const endMonthName = months[eMonth - 1]

		if (cleanStart === cleanEnd) {
			return `${startMonthName} ${sDay}, ${sYear} ⋅ All day`
		}

		if (sYear === eYear) {
			if (sMonth === eMonth) {
				return `${startMonthName} ${sDay} – ${eDay}, ${sYear} ⋅ All day`
			}
			return `${startMonthName} ${sDay} – ${endMonthName} ${eDay}, ${sYear} ⋅ All day`
		}

		return `${startMonthName} ${sDay}, ${sYear} – ${endMonthName} ${eDay}, ${eYear} ⋅ All day`
	}

	const startDate = new Date(cleanStart)
	const endDate = new Date(cleanEnd)

	const sDay = startDate.getDate()
	const sMonth = months[startDate.getMonth()]
	const sYear = startDate.getFullYear()
	const startTime = formatTime(startDate, format)

	const eDay = endDate.getDate()
	const eMonth = months[endDate.getMonth()]
	const eYear = endDate.getFullYear()
	const endTime = formatTime(endDate, format)

	const isSameDay = sYear === eYear && startDate.getMonth() === endDate.getMonth() && sDay === eDay

	if (isSameDay) {
		return `${sMonth} ${sDay}, ${sYear} ⋅ ${startTime} – ${endTime}`
	}

	if (sYear === eYear) {
		return `${sMonth} ${sDay}, ${startTime} – ${eMonth} ${eDay}, ${endTime}`
	}

	return `${sMonth} ${sDay}, ${sYear}, ${startTime} – ${eMonth} ${eDay}, ${eYear}, ${endTime}`
}

