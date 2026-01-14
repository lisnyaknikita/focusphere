import {
	createKanbanTask,
	deleteKanbanTask,
	getKanbanTasks,
	updateKanbanTask,
} from '@/lib/projects/kanban-board-tasks/tasks'
import { touchProject } from '@/lib/projects/projects'
import { CreateKanbanTaskPayload, KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { useEffect, useState } from 'react'
import { useUser } from '../../use-user/use-user'

export const useKanban = (project: Project) => {
	const [tasks, setTasks] = useState<KanbanTask[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { user } = useUser()

	const triggerProjectUpdate = () => {
		touchProject(project.$id).catch(console.error)
	}

	useEffect(() => {
		if (!project?.$id) return

		const fetchTasks = async () => {
			try {
				setIsLoading(true)
				const res = await getKanbanTasks(project.$id)
				setTasks(res.rows as unknown as KanbanTask[])
			} catch (error) {
				console.error('Failed to fetch tasks:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchTasks()
	}, [project?.$id])

	const addTask = async (title: string, status: TaskStatus) => {
		try {
			const payload: CreateKanbanTaskPayload = {
				title,
				status,
				priority: 'medium',
				projectId: project.$id,
				assigneeName: user?.name || 'Unknown user',
			}

			const res = await createKanbanTask(payload)
			setTasks(prev => [...prev, res as unknown as KanbanTask])
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to add task:', error)
		}
	}

	const moveTask = async (taskId: string, newStatus: TaskStatus) => {
		const previousTasks = [...tasks]

		setTasks(prev => prev.map(t => (t.$id === taskId ? { ...t, status: newStatus } : t)))

		try {
			await updateKanbanTask(taskId, { status: newStatus })
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to move task:', error)
			setTasks(previousTasks)
		}
	}

	const updateTask = async (taskId: string, data: Partial<CreateKanbanTaskPayload>) => {
		const previousTasks = [...tasks]

		setTasks(prev => prev.map(t => (t.$id === taskId ? { ...t, ...data } : t)))

		try {
			await updateKanbanTask(taskId, data)
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to update task:', error)
			setTasks(previousTasks)
		}
	}

	const deleteTask = async (taskId: string) => {
		const previousTasks = [...tasks]

		setTasks(prev => prev.filter(t => t.$id !== taskId))

		try {
			await deleteKanbanTask(taskId)
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to delete task:', error)
			setTasks(previousTasks)
		}
	}

	return { tasks, isLoading, addTask, moveTask, updateTask, deleteTask }
}
