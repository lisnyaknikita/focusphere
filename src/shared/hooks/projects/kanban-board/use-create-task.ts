import { Column } from '@/shared/types/kanban'
import { TaskStatus } from '@/shared/types/kanban-task'
import { useState } from 'react'
import { toast } from 'sonner'

export const useCreateTask = ({
	onAddTask,
	column,
}: {
	onAddTask: (title: string, status: TaskStatus) => Promise<void>
	column: Column
}) => {
	const [isAdding, setIsAdding] = useState(false)
	const [title, setTitle] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAddSubmit = async (forcedTitle?: string) => {
		const targetTitle = (forcedTitle ?? title).trim()

		if (!targetTitle) {
			setIsAdding(false)
			setTitle('')
			return
		}

		setIsSubmitting(true)
		try {
			await onAddTask(targetTitle, column.id as TaskStatus)
			setTitle('')
			setIsAdding(false)
		} catch (err: unknown) {
			console.error('Error adding task:', err)
			toast.error('Error adding task')
		} finally {
			setIsSubmitting(false)
		}
	}

	return { isAdding, title, setTitle, handleAddSubmit, setIsAdding, isSubmitting }
}
