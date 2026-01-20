import { createNewProject } from '@/app/(main)/projects/new/components/main/new-project-form/create-project-service/create-project-service'
import { ProjectFormValues } from '@/shared/schemas/project-schema'
import { AppwriteException } from 'appwrite'
import { useState } from 'react'

export const useCreateProject = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const create = async (data: ProjectFormValues, onSuccess: (id: string) => void) => {
		setIsLoading(true)
		setError(null)

		try {
			const project = await createNewProject(data)
			onSuccess(project.$id)
		} catch (err) {
			if (err instanceof AppwriteException || err instanceof Error) {
				setError(err.message)
			} else {
				setError('An unexpected error occurred')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return { create, isLoading, error }
}
