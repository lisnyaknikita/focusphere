import { deleteProject } from '@/lib/projects/projects'
import { AppwriteException } from 'appwrite'
import { useState } from 'react'
import { toast } from 'sonner'

export const useDeleteProject = () => {
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const remove = async (projectId: string, onSuccess?: () => void) => {
		setIsDeleting(true)
		setError(null)

		const deletePromise = deleteProject(projectId)

		toast.promise(deletePromise, {
			loading: 'Deleting project...',
			success: 'Project removed',
			error: 'Could not delete project',
		})

		try {
			await deletePromise
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
