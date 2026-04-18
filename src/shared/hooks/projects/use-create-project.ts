import { createNewProject } from '@/app/(main)/projects/new/components/main/new-project-form/create-project-service/create-project-service'
import { ProjectFormValues } from '@/shared/schemas/project-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppwriteException } from 'appwrite'
import { toast } from 'sonner'

export const useCreateProject = () => {
	const queryClient = useQueryClient()

	const { mutate, isPending, error } = useMutation({
		mutationFn: (data: ProjectFormValues) => createNewProject(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
		onError: err => {
			const message =
				err instanceof AppwriteException || err instanceof Error ? err.message : 'Failed to create project'
			toast.error(message)
		},
	})

	const create = async (data: ProjectFormValues, onSuccess: (id: string) => void) => {
		const createPromise = new Promise<string>((resolve, reject) => {
			mutate(data, {
				onSuccess: project => resolve(project.$id),
				onError: reject,
			})
		})

		toast.promise(createPromise, {
			loading: 'Creating your project...',
			success: 'Project created!',
			error: () => '',
		})

		createPromise.then(id => onSuccess(id)).catch(() => {})
	}

	return { create, isLoading: isPending, error: error?.message ?? null }
}
