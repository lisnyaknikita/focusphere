import { useProject } from '@/shared/context/project-context'
import { useUser } from '@/shared/hooks/use-user/use-user'

export const useProjectPermissions = () => {
	const { project } = useProject()
	const { user } = useUser()

	const isOwner = !!project && !!user && project.ownerId === user.$id

	return {
		isOwner,
		canManageSprints: isOwner,
	}
}
