import {
	createKanbanSubtask,
	deleteKanbanSubtask,
	getKanbanSubtasks,
	updateKanbanSubtask,
} from '@/lib/projects/kanban-board-tasks/subtasks'
import { useProject } from '@/shared/context/project-context'
import { KanbanSubtask, SubtaskStatus } from '@/shared/types/kanban-subtask'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUser } from '../../use-user/use-user'

export const useSubtasks = (taskId: string) => {
	const queryClient = useQueryClient()
	const { project } = useProject()
	const { user } = useUser()

	const [subtasks, setSubtasks] = useState<KanbanSubtask[]>([])

	const { data: fetchedSubtasks, isLoading } = useQuery({
		queryKey: ['subtasks', taskId],
		queryFn: async () => {
			const res = await getKanbanSubtasks(taskId)
			return res.rows as unknown as KanbanSubtask[]
		},
		enabled: !!taskId,
	})

	useEffect(() => {
		if (fetchedSubtasks) {
			setSubtasks(fetchedSubtasks)
		}
	}, [fetchedSubtasks])

	const { mutateAsync: createSubtaskMutate } = useMutation({
		mutationFn: (payload: {
			taskId: string
			title: string
			status: SubtaskStatus
			assigneeId: string
			assigneeName: string
		}) => createKanbanSubtask(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
		},
	})

	const addSubtask = async (title: string): Promise<void> => {
		try {
			const isSoloProject = !project?.teamId
			const defaultAssigneeId = isSoloProject && user ? user.$id : ''
			const defaultAssigneeName = isSoloProject && user ? user.name || user.email.split('@')[0] : 'Unassigned'

			const payload = {
				taskId,
				title,
				status: 'todo' as SubtaskStatus,
				assigneeId: defaultAssigneeId,
				assigneeName: defaultAssigneeName,
			}

			await createSubtaskMutate(payload)
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to create subtask')
		}
	}

	const updateSubtask = async (subtaskId: string, data: Partial<KanbanSubtask>): Promise<void> => {
		const previous = [...subtasks]
		setSubtasks(prev => prev.map(s => (s.$id === subtaskId ? { ...s, ...data } : s)))

		try {
			await updateKanbanSubtask(subtaskId, data)
			queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
		} catch (err: unknown) {
			setSubtasks(previous)
			console.error(err)
			toast.error('Failed to update subtask')
		}
	}

	const deleteSubtask = async (subtaskId: string): Promise<void> => {
		const previous = [...subtasks]
		setSubtasks(prev => prev.filter(s => s.$id !== subtaskId))

		try {
			await deleteKanbanSubtask(subtaskId)
			queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] })
		} catch (err: unknown) {
			setSubtasks(previous)
			console.error(err)
			toast.error('Failed to delete subtask')
		}
	}

	return { subtasks, isLoading, addSubtask, updateSubtask, deleteSubtask }
}
