import 'temporal-polyfill/global'

export const getUserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

export interface ExtractedDateTime {
	date: string
	time: string
	isAllDay: boolean
}

export const extractDateTimeComponents = (value: string | { toString(): string }): ExtractedDateTime => {
	if (!value) {
		const today = Temporal.Now.plainDateISO().toString()
		return { date: today, time: '09:00', isAllDay: false }
	}

	const str = value.toString().replace(' ', 'T')
	const isAllDay = !str.includes('T') && str.length <= 10

	if (isAllDay) {
		return {
			date: str,
			time: '00:00',
			isAllDay: true,
		}
	}

	try {
		const zdt = parseIsoToZonedDateTime(str)
		if ('hour' in zdt) {
			const hour = String(zdt.hour).padStart(2, '0')
			const minute = String(zdt.minute).padStart(2, '0')
			const date = zdt.toPlainDate().toString()
			return { date, time: `${hour}:${minute}`, isAllDay: false }
		}
		return { date: zdt.toString(), time: '00:00', isAllDay: true }
	} catch {
		const datePart = str.split('T')[0] || Temporal.Now.plainDateISO().toString()
		const timePart = str.split('T')[1]?.slice(0, 5) || '09:00'
		return { date: datePart, time: timePart, isAllDay: false }
	}
}

export const localDateTimeToInstant = (date: string, time: string): string => {
	const timeWithSeconds = time.length === 5 ? `${time}:00` : time
	return Temporal.PlainDateTime.from(`${date}T${timeWithSeconds}`)
		.toZonedDateTime(getUserTimeZone())
		.toInstant()
		.toString()
}

export const scheduleXDateTimeToInstant = (value: string | { toString(): string }): string => {
	const text = value.toString().replace(' ', 'T')
	if (text.length <= 10) return text

	const hasTimeZoneOffset = text.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(text)

	if (!hasTimeZoneOffset) {
		return Temporal.PlainDateTime.from(text).toZonedDateTime(getUserTimeZone()).toInstant().toString()
	}

	return Temporal.Instant.from(text).toString()
}

export const parseIsoToZonedDateTime = (iso: string) => {
	const str = iso.replace(' ', 'T')
	if (!str.includes('T') && str.length <= 10) {
		return Temporal.PlainDate.from(str)
	}

	const hasTimeZoneOffset = str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str)

	if (!hasTimeZoneOffset) {
		return Temporal.PlainDateTime.from(str).toZonedDateTime(getUserTimeZone())
	}

	return Temporal.Instant.from(str).toZonedDateTimeISO(getUserTimeZone())
}

export const addDaysToDateString = (dateStr: string, days: number): string => {
	return Temporal.PlainDate.from(dateStr).add({ days }).toString()
}

export const subtractDaysFromDateString = (dateStr: string, days: number): string => {
	return Temporal.PlainDate.from(dateStr).subtract({ days }).toString()
}
