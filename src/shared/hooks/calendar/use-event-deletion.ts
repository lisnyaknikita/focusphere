import { deleteEvent } from '@/lib/events/events'
import { useCallback } from 'react'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useEventDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const handleDelete = useCallback(
		async (id: string) => {
			const confirmed = window.confirm('Delete this event?')
			if (!confirmed) {
				return
			}

			try {
				await deleteEvent(id)

				eventsService.remove(id)

				eventModal.close()
			} catch (error) {
				console.error('Error deleting event:', error)
				alert('Failed to delete event. Please try again.')
			}
		},
		[eventsService, eventModal]
	)

	return { handleDelete }
}
