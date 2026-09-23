import { CreateEventPayload } from '@/shared/types/event'
import { localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
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
			const startStr = currentCopied.start.toString()
			const endStr = currentCopied.end.toString()
			const dateIso = date.toString()

			setCopiedEvent(null)

			const isAllDay = !startStr.includes('T') && startStr.length <= 10
			let startDate: string
			let endDate: string

			if (isAllDay) {
				const origStartDate = Temporal.PlainDate.from(startStr.slice(0, 10))
				const origEndDate = Temporal.PlainDate.from(endStr.slice(0, 10))
				const durationDays = origStartDate.until(origEndDate, { largestUnit: 'days' }).days
				startDate = dateIso
				endDate = date.add({ days: Math.max(0, durationDays) }).toString()
			} else {
				const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
				const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'
				const startDay = startStr.slice(0, 10)
				const endDay = endStr.slice(0, 10)
				let endTargetDate = dateIso
				try {
					const sDay = Temporal.PlainDate.from(startDay)
					const eDay = Temporal.PlainDate.from(endDay)
					const diffDays = sDay.until(eDay, { largestUnit: 'days' }).days
					if (diffDays > 0) {
						endTargetDate = date.add({ days: diffDays }).toString()
					}
				} catch {}

				startDate = localDateTimeToInstant(dateIso, startTime)
				endDate = localDateTimeToInstant(endTargetDate, endTime)
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
