import 'temporal-polyfill/global'

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const localDateTimeToInstant = (date: string, time: string) => {
	const timeWithSeconds = time.length === 5 ? `${time}:00` : time
	return Temporal.PlainDateTime.from(`${date}T${timeWithSeconds}`).toZonedDateTime(timeZone()).toInstant().toString()
}

export const scheduleXDateTimeToInstant = (value: string | { toString(): string }) => {
	const text = value.toString().replace(' ', 'T')
	if (text.length <= 10) return text

	try {
		return Temporal.ZonedDateTime.from(text).toInstant().toString()
	} catch {
		try {
			return Temporal.Instant.from(text).toString()
		} catch {
			const plain = Temporal.PlainDateTime.from(text)
			return plain.toZonedDateTime(timeZone()).toInstant().toString()
		}
	}
}
