import { Column } from '@/shared/types/kanban'
import { TaskStatus } from '@/shared/types/kanban-task'
import { useState } from 'react'

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

	const handleAddSubmit = async () => {
		if (!title.trim()) {
			setIsAdding(false)
			return
		}

		setIsSubmitting(true)

		try {
			await onAddTask(title, column.id as TaskStatus)
			setTitle('')
			setIsAdding(false)
		} catch (error) {
			console.error('Error adding task:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return { isAdding, title, setTitle, handleAddSubmit, setIsAdding, isSubmitting }
}
