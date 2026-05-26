'use client'

import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { KanbanTask } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { useState } from 'react'
import { toast } from 'sonner'

export const useBacklogState = (project: Project) => {
	const [isAddingInline, setIsAddingInline] = useState(false)
	const [inlineTitle, setInlineTitle] = useState('')
	const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)

	const { tasks, isLoading: isKanbanLoading, addTask, moveTask, updateTask, deleteTask } = useKanban(project)

	const backlogTasks = tasks.filter(task => task.status === 'backlog')

	const handleInlineSubmit = async () => {
		const trimmedTitle = inlineTitle.trim()

		if (trimmedTitle === '') {
			setIsAddingInline(false)
			return
		}

		try {
			await addTask(trimmedTitle, 'backlog')
			toast.success('Task added to backlog')
		} catch (error) {
			console.error(error)
		} finally {
			setInlineTitle('')
			setIsAddingInline(false)
		}
	}

	const handleMoveToTodo = async (taskId: string) => {
		try {
			await moveTask(taskId, 'todo')
			toast.success('Task moved to To Do')
		} catch (error) {
			console.error('Failed to move task:', error)
		}
	}

	const handleDeleteConfirm = async () => {
		if (!taskToDelete) return
		try {
			await deleteTask(taskToDelete.$id)
			setTaskToDelete(null)
		} catch (error) {
			console.error('Failed to delete task:', error)
			toast.error('Error while deleting task from backlog')
		}
	}

	return {
		backlogTasks,
		isKanbanLoading,
		updateTask,
		isAddingInline,
		setIsAddingInline,
		inlineTitle,
		setInlineTitle,
		taskToDelete,
		setTaskToDelete,
		handleInlineSubmit,
		handleMoveToTodo,
		handleDeleteConfirm,
	}
}
