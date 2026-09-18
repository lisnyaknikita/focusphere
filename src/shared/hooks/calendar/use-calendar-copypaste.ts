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
			const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
			const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'
			const dateIso = date.toString()

			setCopiedEvent(null)

			await handleCreateEvent({
				title: currentCopied.title || 'Untitled event',
				description: currentCopied.description as string | undefined,
				startDate: localDateTimeToInstant(dateIso, startTime),
				endDate: localDateTimeToInstant(dateIso, endTime),
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
