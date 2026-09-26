import { CreateEventPayload } from '@/shared/types/event'
import { extractDateTimeComponents, localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useCallback, useRef, useState } from 'react'

interface UseCalendarCopyPasteProps {
	user: { $id: string } | null
	quickCreate: (dateTime: Temporal.ZonedDateTime) => void
	handleCreateEvent: (data: CreateEventPayload) => Promise<unknown>
}

export const useCalendarCopyPaste = ({ user, quickCreate, handleCreateEvent }: UseCalendarCopyPasteProps) => {
	const [copiedEvent, setCopiedEvent] = useState<SXEvent | null>(null)
	const copiedEventRef = useRef<SXEvent | null>(null)
	copiedEventRef.current = copiedEvent

	const handleDateClick = useCallback(
		async (date: Temporal.PlainDate) => {
			if (!copiedEventRef.current || !user) {
				quickCreate(date.toZonedDateTime({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }))
				return
			}

			const currentCopied = copiedEventRef.current
			const startParsed = extractDateTimeComponents(currentCopied.start)
			const endParsed = extractDateTimeComponents(currentCopied.end)
			const dateIso = date.toString()

			setCopiedEvent(null)

			let startDate: string
			let endDate: string

			if (startParsed.isAllDay) {
				const origStartDate = Temporal.PlainDate.from(startParsed.date)
				const origEndDate = Temporal.PlainDate.from(endParsed.date)
				const durationDays = origStartDate.until(origEndDate, { largestUnit: 'days' }).days
				startDate = dateIso
				endDate = date.add({ days: Math.max(0, durationDays) }).toString()
			} else {
				let endTargetDate = dateIso
				try {
					const sDay = Temporal.PlainDate.from(startParsed.date)
					const eDay = Temporal.PlainDate.from(endParsed.date)
					const diffDays = sDay.until(eDay, { largestUnit: 'days' }).days
					if (diffDays > 0) {
						endTargetDate = date.add({ days: diffDays }).toString()
					}
				} catch {}

				startDate = localDateTimeToInstant(dateIso, startParsed.time)
				endDate = localDateTimeToInstant(endTargetDate, endParsed.time)
			}

			await handleCreateEvent({
				title: currentCopied.title || 'Untitled event',
				description: currentCopied.description as string | undefined,
				startDate,
				endDate,
				color: (currentCopied.color as string) || '#D79716',
				calendarId: (currentCopied.calendarId as string) || 'default',
				userId: user.$id,
			})
		},
		[handleCreateEvent, quickCreate, user]
	)

	return {
		copiedEvent,
		setCopiedEvent,
		handleDateClick,
		isCopyMode: Boolean(copiedEvent),
	}
}
