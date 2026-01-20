import { useProject } from '@/shared/context/project-context'
import { useState } from 'react'

export const useNewNote = (onClose: () => void) => {
	const [title, setTitle] = useState('')
	const { createNote } = useProject()

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim()) return

		try {
			await createNote(title)
			onClose()
		} catch (error) {
			console.error('Failed to create note:', error)
		}
	}

	return {
		title,
		setTitle,
		onSubmit,
	}
}
