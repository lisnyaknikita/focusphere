import { deleteProject } from '@/lib/projects/projects'
import { AppwriteException } from 'appwrite'
import { useState } from 'react'

export const useDeleteProject = () => {
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const remove = async (projectId: string, onSuccess?: () => void) => {
		const isConfirmed = confirm('Are you sure you want to delete this project? This action cannot be undone.')
		if (!isConfirmed) return

		setIsDeleting(true)
		setError(null)

		try {
			await deleteProject(projectId)
			if (onSuccess) onSuccess()
		} catch (err) {
			if (err instanceof AppwriteException || err instanceof Error) {
				setError(err.message)
			} else {
				setError('An unexpected error occurred during deletion')
			}
		} finally {
			setIsDeleting(false)
		}
	}

	return { remove, isDeleting, error }
}
