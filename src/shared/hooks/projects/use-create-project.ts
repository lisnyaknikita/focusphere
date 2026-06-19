import { createNewProject } from '@/app/(main)/projects/new/components/main/new-project-form/create-project-service/create-project-service'
import { getProjectById, updateProject } from '@/lib/projects/projects'
import { ProjectFormValues } from '@/shared/schemas/project-schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppwriteException } from 'appwrite'
import { toast } from 'sonner'

export const useProjectOperations = (projectId: string | null) => {
	const queryClient = useQueryClient()

	const { data: project, isLoading: isFetching } = useQuery({
		queryKey: ['project', projectId],
		queryFn: () => getProjectById(projectId!),
		enabled: !!projectId,
		staleTime: 0,
	})

	const { mutateAsync: createMutate, isPending: isCreating } = useMutation({
		mutationFn: (data: ProjectFormValues) => createNewProject(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
	})

	const { mutateAsync: updateMutate, isPending: isUpdating } = useMutation({
		mutationFn: (data: ProjectFormValues) => updateProject(projectId!, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			queryClient.invalidateQueries({ queryKey: ['project', projectId] })
		},
	})

	const createProject = async (data: ProjectFormValues) => {
		const promise = createMutate(data)
		toast.promise(promise, {
			loading: 'Creating your project...',
			success: 'Project created!',
			error: err =>
				err instanceof AppwriteException || err instanceof Error ? err.message : 'Failed to create project',
		})
		return promise
	}

	const updateProjectData = async (data: ProjectFormValues) => {
		const promise = updateMutate(data)
		toast.promise(promise, {
			loading: 'Saving project changes...',
			success: 'Project updated successfully!',
			error: err =>
				err instanceof AppwriteException || err instanceof Error ? err.message : 'Failed to update project',
		})
		return promise
	}

	return {
		project,
		isFetching,
		createProject,
		isCreating,
		updateProject: updateProjectData,
		isUpdating,
	}
}
