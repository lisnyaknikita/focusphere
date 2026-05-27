import {
	createKanbanSubtask,
	deleteKanbanSubtask,
	getKanbanSubtasks,
	updateKanbanSubtask,
} from '@/lib/projects/kanban-board-tasks/subtasks'
import { useProject } from '@/shared/context/project-context'
import { KanbanSubtask, SubtaskStatus } from '@/shared/types/kanban-subtask'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUser } from '../../use-user/use-user'

export const useSubtasks = (taskId: string) => {
	const [subtasks, setSubtasks] = useState<KanbanSubtask[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { project } = useProject()
	const { user } = useUser()

	useEffect(() => {
		const fetchSubtasks = async () => {
			try {
				setIsLoading(true)
				const res = await getKanbanSubtasks(taskId)
				setSubtasks(res.rows as unknown as KanbanSubtask[])
			} catch (err) {
				console.error('Failed to fetch subtasks:', err)
			} finally {
				setIsLoading(false)
			}
		}
		if (taskId) fetchSubtasks()
	}, [taskId])

	const addSubtask = async (title: string) => {
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
			const res = await createKanbanSubtask(payload)
			setSubtasks(prev => [...prev, res as unknown as KanbanSubtask])
		} catch (err) {
			console.error(err)
			toast.error('Failed to create subtask')
		}
	}

	const updateSubtask = async (subtaskId: string, data: Partial<KanbanSubtask>) => {
		const previous = [...subtasks]
		setSubtasks(prev => prev.map(s => (s.$id === subtaskId ? { ...s, ...data } : s)))

		try {
			await updateKanbanSubtask(subtaskId, data)
		} catch (err) {
			setSubtasks(previous)
			console.error(err)
			toast.error('Failed to update subtask')
		}
	}

	const deleteSubtask = async (subtaskId: string) => {
		const previous = [...subtasks]
		setSubtasks(prev => prev.filter(s => s.$id !== subtaskId))

		try {
			await deleteKanbanSubtask(subtaskId)
		} catch (err) {
			setSubtasks(previous)
			console.error(err)
			toast.error('Failed to delete subtask')
		}
	}

	return { subtasks, isLoading, addSubtask, updateSubtask, deleteSubtask }
}
