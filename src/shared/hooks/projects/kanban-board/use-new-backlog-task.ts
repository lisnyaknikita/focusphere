import { useState } from 'react'

interface useNewBacklogTaskProps {
	onClose: () => void
	onAddTask: (title: string) => Promise<void>
}

export const useNewBacklogTask = ({ onAddTask, onClose }: useNewBacklogTaskProps) => {
	const [title, setTitle] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			await onAddTask(title.trim())
			onClose()
		} catch (error) {
			console.error('Failed to create task:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		title,
		setTitle,
		isSubmitting,
		setIsSubmitting,
		handleSubmit,
	}
}
