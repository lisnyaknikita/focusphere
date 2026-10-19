export const isRecurringEvent = (event: { recurrenceRule?: string; _isRecurrenceInstance?: boolean }): boolean => {
	return Boolean(event.recurrenceRule || event._isRecurrenceInstance)
}

export const isRecurrenceInstanceId = (id: string | number): boolean => {
	return String(id).includes('__recur__')
}

export const parseRecurrenceInstanceId = (
	id: string | number
): { masterEventId: string; instanceDate: string } | null => {
	const str = String(id)
	const parts = str.split('__recur__')
	if (parts.length === 2) {
		return { masterEventId: parts[0], instanceDate: parts[1] }
	}
	return null
}
