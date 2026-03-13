export const formatDividerDate = (dateString: string) => {
	const date = new Date(dateString)
	const today = new Date()
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)

	if (date.toDateString() === today.toDateString()) return 'Today'
	if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})
}
