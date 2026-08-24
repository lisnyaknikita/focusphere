export const backlogFormatDateRange = (startIso: string, endIso: string) => {
	try {
		const start = new Date(startIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
		const end = new Date(endIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
		return `${start} – ${end}`
	} catch {
		return ''
	}
}
