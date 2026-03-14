import { updateProject } from '@/lib/projects/projects'
import { Project } from '@/shared/types/project'

interface UseToggleFavoriteProps {
	onRefresh: () => Promise<void>
	project: Project
}

export const useToggleFavorite = ({ onRefresh, project }: UseToggleFavoriteProps) => {
	const handleToggleFavorite = async (e: React.MouseEvent) => {
		e.preventDefault()
		try {
			await updateProject(project.$id, { isFavorite: !project.isFavorite })
			onRefresh()
		} catch (err) {
			console.error(err)
		} finally {
		}
	}

	return { handleToggleFavorite }
}
