import { useCalendarMutations } from '@/shared/hooks/calendar/use-calendar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import type { createEventModalPlugin } from '@schedule-x/event-modal'
import type { createEventsServicePlugin } from '@schedule-x/events-service'
import { useCallback, useState } from 'react'

interface UseCalendarModalsProps {
	eventsService: ReturnType<typeof createEventsServicePlugin>
	eventModal: ReturnType<typeof createEventModalPlugin>
	setCopiedEvent: (event: SXEvent | null) => void
}

export const useCalendarModals = ({ eventsService, eventModal, setCopiedEvent }: UseCalendarModalsProps) => {
	const [selectedEventForModal, setSelectedEventForModal] = useState<SXEvent | null>(null)
	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)

	const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()
	const { handleDelete } = useEventDeletion({ eventsService, eventModal })

	const handleConfirmDelete = useCallback(async () => {
		if (eventToDelete) {
			await handleDelete(String(eventToDelete.id), eventToDelete.googleEventId as string | undefined)
			setEventToDelete(null)
		}
	}, [eventToDelete, handleDelete])

	const handleRecurrenceDelete = useCallback(
		async (scope: 'this' | 'all') => {
			if (eventToDelete) {
				await handleDelete(String(eventToDelete.id), eventToDelete.googleEventId as string | undefined, scope)
				setEventToDelete(null)
			}
		},
		[eventToDelete, handleDelete]
	)

	const renderEventInfoModal = useCallback(
		(event: SXEvent, onCloseModal?: () => void) => (
			<EventInfoModal
				event={event}
				onConfirmDelete={() => {
					setEventToDelete(event)
					onCloseModal?.()
				}}
				onUpdated={() => onCloseModal?.()}
				onCopy={() => {
					setCopiedEvent(event)
					onCloseModal?.()
				}}
				actions={{ create: handleCreateEvent, update: handleUpdateEvent }}
			/>
		),
		[handleCreateEvent, handleUpdateEvent, setCopiedEvent]
	)

	return {
		selectedEventForModal,
		setSelectedEventForModal,
		eventToDelete,
		setEventToDelete,
		handleConfirmDelete,
		handleRecurrenceDelete,
		renderEventInfoModal,
	}
}
