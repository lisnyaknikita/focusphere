import { deleteEvent } from '@/lib/events/events'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useEventDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const handleDelete = useCallback(
		async (id: string) => {
			const deletePromise = id.startsWith('g_')
				? import('@/shared/services/google-calendar.service').then(m => m.googleCalendarService.deleteEvent(id))
				: deleteEvent(id)

			toast.promise(deletePromise, {
				loading: 'Deleting event...',
				success: 'Event deleted',
				error: 'Failed to delete event',
			})
			try {
				await deletePromise
				eventsService.remove(id)
				eventModal.close()
			} catch (error) {
				console.error('Error deleting event:', error)
			}
		},
		[eventsService, eventModal]
	)

	return { handleDelete }
}
