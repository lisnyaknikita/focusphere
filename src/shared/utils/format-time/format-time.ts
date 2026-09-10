import { TimeFormat } from '@/shared/stores/settings.store'

export const formatTime = (
	dateInput: Date | string | number,
	timeFormat: TimeFormat = '24h'
): string => {
	const date = new Date(dateInput)
	if (isNaN(date.getTime())) return ''

	if (timeFormat === '12h') {
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})
	}

	return date.toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})
}

export const formatTimeString = (timeStr: string, timeFormat: TimeFormat = '24h'): string => {
	if (!timeStr || !timeStr.includes(':')) return timeStr
	const [h, m] = timeStr.split(':').map(Number)
	if (isNaN(h) || isNaN(m)) return timeStr

	if (timeFormat === '12h') {
		const period = h >= 12 ? 'PM' : 'AM'
		const h12 = h % 12 || 12
		return `${h12}:${String(m).padStart(2, '0')} ${period}`
	}

	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
