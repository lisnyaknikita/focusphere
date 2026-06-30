const generateTimeOptions = (): string[] => {
	const options = []
	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 15) {
			const formattedHour = String(hour).padStart(2, '0')
			const formattedMinute = String(minute).padStart(2, '0')
			options.push(`${formattedHour}:${formattedMinute}`)
		}
	}
	return options
}

export const TIME_OPTIONS = generateTimeOptions()

export const getDurationString = (start: string, current: string): string | null => {
	const [startH, startM] = start.split(':').map(Number)
	const [currH, currM] = current.split(':').map(Number)

	const startMinutes = startH * 60 + startM
	const currMinutes = currH * 60 + currM

	if (currMinutes <= startMinutes) return null

	const diff = currMinutes - startMinutes
	const hours = Math.floor(diff / 60)
	const mins = diff % 60

	const parts = []
	if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`)
	if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`)

	return `(${parts.join(' ')})`
}
