import {
	createKanbanTask,
	deleteKanbanTask,
	getKanbanTasks,
	updateKanbanTask,
} from '@/lib/projects/kanban-board-tasks/tasks'
import { touchProject } from '@/lib/projects/projects'
import { Task } from '@/shared/types/kanban'
import { CreateKanbanTaskPayload, KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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

	const reorderTasks = async (newTasks: KanbanTask[]) => {
		const previousTasks = [...tasks]

		setTasks(newTasks)

		try {
			const updatePromises = newTasks.map((task, index) => {
				return updateKanbanTask(task.$id, { position: index } as unknown as Task)
			})

			await Promise.all(updatePromises)
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to reorder tasks:', error)
			setTasks(previousTasks)
			toast.error('Failed to save tasks order')
		}
	}

	const addTask = async (title: string, status: TaskStatus) => {
		try {
			const tasksInColumn = tasks.filter(t => t.status === status)
			const newPosition = tasksInColumn.length

			const payload: CreateKanbanTaskPayload = {
				title,
				status,
				priority: 'medium',
				projectId: project.$id,
				assigneeId: user?.$id || '',
				assigneeName: user?.name || 'Unknown user',
				position: newPosition,
			}

			const res = await createKanbanTask(payload)
			setTasks(prev => [...prev, res as unknown as KanbanTask])
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to add task:', error)
			toast.error('Failed to add task')
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
			toast.error('Failed to move task')
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
			toast.error('Failed to update task')
			setTasks(previousTasks)
		}
	}

	const deleteTask = async (taskId: string) => {
		const previousTasks = [...tasks]

		setTasks(prev => prev.filter(t => t.$id !== taskId))

		const deletePromise = deleteKanbanTask(taskId)

		toast.promise(deletePromise, {
			loading: 'Deleting task...',
			success: 'Task deleted successfully',
			error: 'Failed to delete task',
		})

		try {
			await deletePromise
			triggerProjectUpdate()
		} catch (error) {
			console.error('Failed to delete task:', error)
			setTasks(previousTasks)
		}
	}

	return { tasks, isLoading, addTask, moveTask, updateTask, deleteTask, reorderTasks }
}
