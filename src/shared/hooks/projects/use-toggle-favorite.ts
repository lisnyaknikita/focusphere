import { updateProject } from '@/lib/projects/projects'
import { Project } from '@/shared/types/project'
import { toast } from 'sonner'

interface UseToggleFavoriteProps {
	onRefresh: () => Promise<void>
	project: Project
}

export const useToggleFavorite = ({ onRefresh, project }: UseToggleFavoriteProps) => {
	const handleToggleFavorite = async (e: React.MouseEvent) => {
		e.preventDefault()

		const isAdding = !project.isFavorite
		const loadingMsg = isAdding ? 'Adding to favorites...' : 'Removing from favorites...'
		const successMsg = isAdding ? 'Added to favorites' : 'Removed from favorites'

		const togglePromise = updateProject(project.$id, { isFavorite: isAdding })

		toast.promise(togglePromise, {
			loading: loadingMsg,
			success: successMsg,
			error: 'Failed to update favorites',
		})

		try {
			await togglePromise
			await onRefresh()
		} catch (err) {
			console.error(err)
		} finally {
		}
	}

	return { handleToggleFavorite }
}
