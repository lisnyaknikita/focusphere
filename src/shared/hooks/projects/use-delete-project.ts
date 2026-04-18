import { deleteProject } from '@/lib/projects/projects'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeleteProject = () => {
	const queryClient = useQueryClient()

	const { mutate, isPending, error } = useMutation({
		mutationFn: (projectId: string) => deleteProject(projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
	})

	const remove = (projectId: string, onSuccess?: () => void) => {
		const deletePromise = new Promise<void>((resolve, reject) => {
			mutate(projectId, {
				onSuccess: () => {
					onSuccess?.()
					resolve()
				},
				onError: reject,
			})
		})

		toast.promise(deletePromise, {
			loading: 'Deleting project...',
			success: 'Project removed',
			error: 'Could not delete project',
		})
	}

	return { remove, isDeleting: isPending, error: error?.message ?? null }
}
