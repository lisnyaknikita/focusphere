import { deleteTimeBlock } from '@/lib/planner/planner'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useTimeBlockDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const handleDelete = useCallback(
		async (id: string) => {
			const deletePromise = deleteTimeBlock(id)

			toast.promise(deletePromise, {
				loading: 'Deleting time block...',
				success: 'Time block deleted',
				error: 'Failed to delete time block',
			})
			try {
				await deletePromise
				eventsService.remove(id)
				eventModal.close()
			} catch (error) {
				console.error('Error deleting time block:', error)
				toast.error('Failed to delete this time block')
			}
		},
		[eventsService, eventModal]
	)

	return { handleDelete }
}
