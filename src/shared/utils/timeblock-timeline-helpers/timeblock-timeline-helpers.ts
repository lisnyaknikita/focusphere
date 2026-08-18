type BlockStatus = 'past' | 'current' | 'upcoming'

export const getBlockStatus = (startDateStr: string, endDateStr: string): BlockStatus => {
	const now = new Date()
	const start = new Date(startDateStr)
	const end = new Date(endDateStr)

	if (now > end) return 'past'
	if (now >= start && now <= end) return 'current'
	return 'upcoming'
}

export const formatTimeRange = (startStr: string, endStr: string) => {
	const start = new Date(startStr)
	const end = new Date(endStr)
	const format = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
	return `${format(start)} – ${format(end)}`
}
