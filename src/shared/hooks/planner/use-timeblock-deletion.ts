import { deleteTimeBlock } from '@/lib/planner/planner'
import { useCallback } from 'react'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useTimeBlockDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteTimeBlock(id)

				eventsService.remove(id)

				eventModal.close()
			} catch (error) {
				console.error('Error deleting time block:', error)
				alert('Failed to delete this time block. Please try again.')
			}
		},
		[eventsService, eventModal]
	)

	return { handleDelete }
}
