import { deleteEvent } from '@/lib/events/events'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface IdentifiableEvent {
	$id?: string
	id?: string | number
	googleEventId?: string
}

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useEventDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const queryClient = useQueryClient()

	const handleDelete = useCallback(
		async (id: string, googleEventId?: string) => {
			eventsService.remove(id)
			eventModal.close()

			const filterOutEvent = <T extends IdentifiableEvent>(oldData: T[] | undefined): T[] | undefined => {
				if (!oldData) return oldData
				return oldData.filter(item => item.$id !== id && String(item.id) !== id && item.googleEventId !== googleEventId)
			}

			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['calendar-events-month'] }, filterOutEvent)
			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['calendar-google-events-month'] }, filterOutEvent)
			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['calendar-events'] }, filterOutEvent)
			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['calendar-google-events'] }, filterOutEvent)
			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['events-today-appwrite'] }, filterOutEvent)
			queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['events-today-google'] }, filterOutEvent)

			const deletePromise = (async () => {
				if (id.startsWith('g_')) {
					return import('@/shared/services/google-calendar.service').then(m => m.googleCalendarService.deleteEvent(id))
				}
				if (googleEventId) {
					await import('@/shared/services/google-calendar.service').then(m =>
						m.googleCalendarService.deleteEvent(googleEventId)
					)
				}
				await deleteEvent(id)
			})()

			toast.promise(deletePromise, {
				loading: 'Deleting event...',
				success: 'Event deleted',
				error: 'Failed to delete event',
			})

			try {
				await deletePromise
			} catch (error) {
				console.error('Error deleting event:', error)
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ['calendar-events-month'] }),
					queryClient.invalidateQueries({ queryKey: ['calendar-google-events-month'] }),
					queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'] }),
					queryClient.invalidateQueries({ queryKey: ['events-today-google'] }),
				])
			}
		},
		[eventsService, eventModal, queryClient]
	)

	return { handleDelete }
}
