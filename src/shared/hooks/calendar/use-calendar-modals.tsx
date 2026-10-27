import { useCalendarMutations } from '@/shared/hooks/calendar/use-calendar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { isRecurrenceInstanceId } from '@/shared/utils/calendar/recurrence'
import { scheduleXDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import type { createEventModalPlugin } from '@schedule-x/event-modal'
import type { createEventsServicePlugin } from '@schedule-x/events-service'
import { useCallback, useState } from 'react'

export interface EventUpdatePending {
	event: SXEvent
	startDate: string
	endDate: string
	googleEventId?: string
}

interface UseCalendarModalsProps {
	eventsService: ReturnType<typeof createEventsServicePlugin>
	eventModal: ReturnType<typeof createEventModalPlugin>
	setCopiedEvent: (event: SXEvent | null) => void
	mappedEvents?: SXEvent[]
}

export const useCalendarModals = ({
	eventsService,
	eventModal,
	setCopiedEvent,
	mappedEvents,
}: UseCalendarModalsProps) => {
	const [selectedEventForModal, setSelectedEventForModal] = useState<SXEvent | null>(null)
	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)
	const [eventToUpdate, setEventToUpdate] = useState<EventUpdatePending | null>(null)

	const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()
	const { handleDelete } = useEventDeletion({ eventsService, eventModal })

	const handleEventDragOrResize = useCallback(
		async (updatedEvent: SXEvent) => {
			const { id, start, end, title, description, color } = updatedEvent
			const eventId = String(id)
			const googleEventId = (updatedEvent as unknown as { googleEventId?: string }).googleEventId

			const startDate = scheduleXDateTimeToInstant(start)
			const endDate = scheduleXDateTimeToInstant(end)

			const isRecur =
				isRecurrenceInstanceId(eventId) ||
				Boolean((updatedEvent as unknown as { recurrenceRule?: string }).recurrenceRule)

			if (isRecur) {
				setEventToUpdate({
					event: updatedEvent,
					startDate,
					endDate,
					googleEventId,
				})
				return
			}

			await handleUpdateEvent(
				eventId,
				{
					title: title || 'Untitled event',
					description: description as string | undefined,
					color: color as string | undefined,
					startDate,
					endDate,
				},
				googleEventId,
				'this'
			)
		},
		[handleUpdateEvent]
	)

	const handleRecurrenceUpdateConfirm = useCallback(
		async (scope: 'this' | 'all') => {
			if (!eventToUpdate) return
			const { event, startDate, endDate, googleEventId } = eventToUpdate
			const eventId = String(event.id)
			setEventToUpdate(null)

			await handleUpdateEvent(
				eventId,
				{
					title: event.title || 'Untitled event',
					description: event.description as string | undefined,
					color: event.color as string | undefined,
					startDate,
					endDate,
				},
				googleEventId,
				scope
			)
		},
		[eventToUpdate, handleUpdateEvent]
	)

	const handleRecurrenceUpdateCancel = useCallback(() => {
		if (mappedEvents) {
			eventsService.set(mappedEvents)
		}
		setEventToUpdate(null)
	}, [eventsService, mappedEvents])

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
		eventToUpdate,
		setEventToUpdate,
		handleEventDragOrResize,
		handleRecurrenceUpdateConfirm,
		handleRecurrenceUpdateCancel,
		handleConfirmDelete,
		handleRecurrenceDelete,
		renderEventInfoModal,
	}
}
