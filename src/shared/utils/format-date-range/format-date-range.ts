type DateLike = string | { toString(): string }

export const formatDateRange = (start: DateLike, end: DateLike): string => {
	const startStr = typeof start === 'string' ? start : start.toString()
	const endStr = typeof end === 'string' ? end : end.toString()

	const cleanStart = startStr.replace(/\[.*?\]$/, '')
	const cleanEnd = endStr.replace(/\[.*?\]$/, '')

	const startDate = new Date(cleanStart)
	const endDate = new Date(cleanEnd)

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	const formatTime = (date: Date): string => {
		let hours = date.getHours()
		const minutes = date.getMinutes().toString().padStart(2, '0')
		const ampm = hours >= 12 ? 'PM' : 'AM'
		hours = hours % 12 || 12
		return `${hours}:${minutes} ${ampm}`
	}

	const month = months[startDate.getMonth()]
	const day = startDate.getDate()
	const year = startDate.getFullYear()
	const startTime = formatTime(startDate)
	const endTime = formatTime(endDate)

	return `${month} ${day}, ${year} ⋅ ${startTime} – ${endTime}`
}
