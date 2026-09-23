export interface MonthRangeChunk {
	monthKey: string
	startIso: string
	endIso: string
	startDay: string
	endDay: string
}

export const getMonthsInRange = (startStr: string, endStr: string): MonthRangeChunk[] => {
	if (!startStr || !endStr) return []

	const startClean = startStr.slice(0, 10)
	const endClean = endStr.slice(0, 10)

	const startDate = new Date(`${startClean}T00:00:00.000Z`)
	const endDate = new Date(`${endClean}T23:59:59.999Z`)

	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return []

	const chunks: MonthRangeChunk[] = []
	const current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1))
	const last = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1))

	while (current <= last) {
		const year = current.getUTCFullYear()
		const month = current.getUTCMonth()
		const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

		const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
		const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

		const startDay = monthStart.toISOString().slice(0, 10)
		const endDay = monthEnd.toISOString().slice(0, 10)

		chunks.push({
			monthKey,
			startIso: monthStart.toISOString(),
			endIso: monthEnd.toISOString(),
			startDay,
			endDay,
		})

		current.setUTCMonth(current.getUTCMonth() + 1)
	}

	return chunks
}
