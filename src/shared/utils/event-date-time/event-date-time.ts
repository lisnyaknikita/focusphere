import 'temporal-polyfill/global'

export const getUserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

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
	if (!iso.includes('T') && iso.length <= 10) {
		return Temporal.PlainDate.from(iso)
	}

	const hasTimeZoneOffset = iso.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(iso)

	if (!hasTimeZoneOffset) {
		return Temporal.PlainDateTime.from(iso).toZonedDateTime(getUserTimeZone())
	}

	return Temporal.Instant.from(iso).toZonedDateTimeISO(getUserTimeZone())
}

export const addDaysToDateString = (dateStr: string, days: number): string => {
	return Temporal.PlainDate.from(dateStr).add({ days }).toString()
}

export const subtractDaysFromDateString = (dateStr: string, days: number): string => {
	return Temporal.PlainDate.from(dateStr).subtract({ days }).toString()
}
