import { updateProject } from '@/lib/projects/projects'
import { Project } from '@/shared/types/project'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useToggleFavorite = (project: Project) => {
	const queryClient = useQueryClient()

	const { mutateAsync } = useMutation({
		mutationFn: (isFavorite: boolean) => updateProject(project.$id, { isFavorite }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
		onError: err => console.error(err),
	})

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault()

		const isAdding = !project.isFavorite

		toast.promise(mutateAsync(isAdding), {
			loading: isAdding ? 'Adding to favorites...' : 'Removing from favorites...',
			success: isAdding ? 'Added to favorites' : 'Removed from favorites',
			error: 'Failed to update favorites',
		})
	}

	return { handleToggleFavorite }
}
