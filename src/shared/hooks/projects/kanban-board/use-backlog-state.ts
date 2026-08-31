'use client'

import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useSprints } from '@/shared/hooks/projects/sprints/use-sprints'
import { KanbanTask } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { Sprint } from '@/shared/types/sprint'
import { useState } from 'react'
import { toast } from 'sonner'

export const useBacklogState = (project: Project) => {
	const projectId = project?.$id

	const {
		tasks,
		isLoading: isKanbanLoading,
		addTask,
		moveTaskToSprint,
		reorderBacklogTasks,
		updateTask,
		deleteTask,
	} = useKanban(project)

	const {
		sprints,
		activeSprint,
		plannedSprints,
		completedSprints,
		isLoading: isSprintsLoading,
		startSprint,
		completeSprint,
		deleteSprint,
	} = useSprints(projectId)

	const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
	const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
	const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
	const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null)
	const [addingToSprintId, setAddingToSprintId] = useState<string | null | undefined>(undefined)
	const [inlineTitle, setInlineTitle] = useState('')
	const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleInlineSubmit = async (sprintId: string | null = null) => {
		const trimmedTitle = inlineTitle.trim()

		if (trimmedTitle === '') {
			setAddingToSprintId(undefined)
			return
		}

		if (isSubmitting) return

		setIsSubmitting(true)
		try {
			await addTask(trimmedTitle, 'backlog', sprintId)
			toast.success('Task added')
			setInlineTitle('')
			setAddingToSprintId(undefined)
		} catch (error) {
			console.error(error)
			toast.error('Failed to add task')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteConfirm = async () => {
		if (!taskToDelete) return
		try {
			await deleteTask(taskToDelete.$id)
			setTaskToDelete(null)
		} catch (error) {
			console.error('Failed to delete task:', error)
			toast.error('Error while deleting task')
		}
	}

	const handleStartSprint = async (sprintId: string) => {
		try {
			await startSprint(sprintId)
		} catch (error) {
			console.error('Failed to start sprint:', error)
		}
	}

	const handleCompleteSprintConfirm = async () => {
		if (!sprintToComplete) return
		try {
			await completeSprint(sprintToComplete.$id)
			setSprintToComplete(null)
		} catch (error) {
			console.error('Failed to complete sprint:', error)
		}
	}

	const handleDeleteSprintConfirm = async () => {
		if (!sprintToDelete) return
		try {
			await deleteSprint(sprintToDelete.$id)
			setSprintToDelete(null)
		} catch (error) {
			console.error('Failed to delete sprint:', error)
		}
	}

	return {
		tasks,
		sprints,
		activeSprint,
		plannedSprints,
		completedSprints,
		isLoading: isKanbanLoading || isSprintsLoading,
		updateTask,
		deleteTask,
		moveTaskToSprint,
		reorderBacklogTasks,
		addingToSprintId,
		setAddingToSprintId,
		inlineTitle,
		setInlineTitle,
		taskToDelete,
		setTaskToDelete,
		isSubmitting,
		isCreateSprintModalOpen,
		setIsCreateSprintModalOpen,
		editingSprint,
		setEditingSprint,
		sprintToComplete,
		setSprintToComplete,
		sprintToDelete,
		setSprintToDelete,
		handleInlineSubmit,
		handleDeleteConfirm,
		handleStartSprint,
		handleCompleteSprintConfirm,
		handleDeleteSprintConfirm,
	}
}
