export const useToday = () => {
	const today = Temporal.Now.plainDateISO()

	return {
		plainDate: today,
		iso: today.toString(),
		day: today.day,
		weekday: today.toLocaleString('en-US', { weekday: 'long' }),
		month: today.toLocaleString('en-US', { month: 'long' }),
	}
}
