import {
	createKanbanTask,
	deleteKanbanTask,
	getKanbanTasks,
	updateKanbanTask,
} from '@/lib/projects/kanban-board-tasks/tasks'
import { touchProject, updateProject } from '@/lib/projects/projects'
import { Column, Task } from '@/shared/types/kanban'
import { CreateKanbanTaskPayload, KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUser } from '../../use-user/use-user'

const DEFAULT_COLUMNS: Column[] = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'inprogress', title: 'In Progress' },
	{ id: 'done', title: 'Done' },
]

export const useKanban = (project: Project) => {
	const queryClient = useQueryClient()
	const { user } = useUser()
	const projectId = project?.$id

	const [tasks, setTasks] = useState<KanbanTask[]>([])
	const [columns, setColumns] = useState<Column[]>([])

	useEffect(() => {
		if (project?.columns && project.columns.length > 0) {
			setColumns(project.columns.map((col: string) => JSON.parse(col) as Column))
		} else {
			setColumns(DEFAULT_COLUMNS)
		}
	}, [project?.columns])

	const { data: fetchedTasks, isLoading: isTasksLoading } = useQuery({
		queryKey: ['kanban-tasks', projectId],
		queryFn: async () => {
			const res = await getKanbanTasks(projectId)
			return res.rows as unknown as KanbanTask[]
		},
		enabled: !!projectId,
		refetchOnWindowFocus: true,
		staleTime: 0,
	})

	useEffect(() => {
		if (fetchedTasks) {
			setTasks(fetchedTasks)
		}
	}, [fetchedTasks])

	const triggerProjectUpdate = (): void => {
		touchProject(projectId).catch((err: unknown) => {
			console.error('Failed to touch project:', err)
		})
	}

	const { mutateAsync: updateColumnsMutate } = useMutation({
		mutationFn: (newColumns: Column[]) => updateProject(projectId, { columns: newColumns.map(c => JSON.stringify(c)) }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['project', projectId] })
		},
	})

	const { mutateAsync: createTaskMutate } = useMutation({
		mutationFn: (payload: CreateKanbanTaskPayload) => createKanbanTask(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			triggerProjectUpdate()
		},
	})

	const addColumn = async (id: string, title: string): Promise<void> => {
		const updatedColumns = [...columns, { id, title }]
		setColumns(updatedColumns)
		try {
			await updateColumnsMutate(updatedColumns)
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to add column')
		}
	}

	const updateColumnTitle = async (columnId: string, newTitle: string): Promise<void> => {
		const updated = columns.map(col => (col.id === columnId ? { ...col, title: newTitle } : col))
		setColumns(updated)
		try {
			await updateColumnsMutate(updated)
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to update column title')
		}
	}

	const deleteColumnCascade = async (targetColumnId: string): Promise<void> => {
		const updatedColumns = columns.filter(col => col.id !== targetColumnId)
		const remainingTasks = tasks.filter(task => task.status !== targetColumnId)

		setColumns(updatedColumns)
		setTasks(remainingTasks)

		try {
			await updateColumnsMutate(updatedColumns)
			const tasksToDelete = tasks.filter(task => task.status === targetColumnId)

			if (tasksToDelete.length > 0) {
				const batchDeletes = tasksToDelete.map(task => deleteKanbanTask(task.$id))
				await Promise.all(batchDeletes)
			}
			triggerProjectUpdate()
			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to delete column')
		}
	}

	const addTask = async (title: string, status: TaskStatus): Promise<void> => {
		try {
			const tasksInColumn = tasks.filter(t => t.status === status)
			const newPosition = tasksInColumn.length
			const currentCounter = project.taskCounter || 0
			const newCounter = currentCounter + 1
			const taskCode = `${project.prefix || 'TSK'}-${newCounter}`

			await updateProject(projectId, { taskCounter: newCounter })
			queryClient.invalidateQueries({ queryKey: ['project', projectId] })

			const payload: CreateKanbanTaskPayload = {
				title,
				status,
				priority: 'medium',
				projectId,
				taskCode,
				assigneeId: user?.$id || '',
				assigneeName: user?.name || 'Unknown user',
				position: newPosition,
			}

			await createTaskMutate(payload)
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to add task')
		}
	}

	const moveTask = async (taskId: string, newStatus: TaskStatus, overTaskId?: string): Promise<void> => {
		const taskToMove = tasks.find(t => t.$id === taskId)
		if (!taskToMove) return

		const remainingTasks = tasks.filter(t => t.$id !== taskId)
		let finalizedTasks: KanbanTask[] = []

		if (overTaskId) {
			const overTaskIndex = remainingTasks.findIndex(t => t.$id === overTaskId)
			const updated = [...remainingTasks]

			updated.splice(overTaskIndex, 0, { ...taskToMove, status: newStatus })

			let targetPos = 0
			finalizedTasks = updated.map(t => {
				if (t.status === newStatus) {
					return { ...t, position: targetPos++ }
				}
				return t
			})
		} else {
			const tasksInNewCol = remainingTasks.filter(t => t.status === newStatus)
			const newPosition = tasksInNewCol.length > 0 ? Math.max(...tasksInNewCol.map(t => t.position || 0)) + 1 : 0

			finalizedTasks = [...remainingTasks, { ...taskToMove, status: newStatus, position: newPosition }]
		}

		setTasks(finalizedTasks)

		try {
			const movingTaskFinal = finalizedTasks.find(t => t.$id === taskId)
			await updateKanbanTask(taskId, { status: newStatus, position: movingTaskFinal?.position || 0 })

			if (overTaskId) {
				const targetColTasks = finalizedTasks.filter(t => t.status === newStatus)
				await Promise.all(targetColTasks.map(t => updateKanbanTask(t.$id, { position: t.position } as unknown as Task)))
			}

			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to move task')
		}
	}

	const reorderTasks = async (newTasks: KanbanTask[], status: TaskStatus): Promise<void> => {
		let colPosition = 0
		const finalizedTasks = newTasks.map(t => {
			if (t.status === status) {
				return { ...t, position: colPosition++ }
			}
			return t
		})

		setTasks(finalizedTasks)

		try {
			const colTasks = finalizedTasks.filter(t => t.status === status)
			await Promise.all(colTasks.map(t => updateKanbanTask(t.$id, { position: t.position } as unknown as Task)))

			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to save tasks order')
		}
	}

	const updateTask = async (taskId: string, data: Partial<CreateKanbanTaskPayload>): Promise<void> => {
		setTasks(prev => prev.map(t => (t.$id === taskId ? { ...t, ...data } : t)))
		try {
			await updateKanbanTask(taskId, data)

			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to update task')
		}
	}

	const deleteTask = async (taskId: string): Promise<void> => {
		setTasks(prev => prev.filter(t => t.$id !== taskId))
		try {
			await deleteKanbanTask(taskId)

			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			triggerProjectUpdate()
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to delete task')
		}
	}

	return {
		tasks,
		columns,
		setColumns,
		isLoading: isTasksLoading && tasks.length === 0,
		addColumn,
		updateColumnTitle,
		deleteColumnCascade,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		reorderTasks,
		updateColumnsMutate,
		triggerProjectUpdate,
	}
}
