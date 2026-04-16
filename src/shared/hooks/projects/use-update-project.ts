import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { convertToTeamProject, updateProject } from '@/lib/projects/projects'
import { useProject } from '@/shared/context/project-context'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { Project } from '@/shared/types/project'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface useUpdateProjectProps {
	project: Project
	onSuccess: () => void
}

export const useUpdateProject = ({ project, onSuccess }: useUpdateProjectProps) => {
	const { updateProjectState } = useProject()

	const formMethods = useForm<ProjectFormValues>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: project.title,
			description: project.description ?? '',
			type: project.type,
			color: project.color || CALENDAR_COLORS.GOLD,
		},
	})

	const onSubmit = async (data: ProjectFormValues) => {
		const updateAction = (async () => {
			if (data.type === 'team' && project.type === 'solo') {
				const updatedDoc = await convertToTeamProject(project.$id, project.ownerId, data.title)
				updateProjectState(updatedDoc as unknown as Project)
				return updatedDoc
			} else {
				await updateProject(project.$id, data)
				updateProjectState(data)
			}
		})()

		toast.promise(updateAction, {
			loading: 'Updating project settings...',
			success: 'Changes saved',
			error: 'Failed to update project',
		})

		try {
			await updateAction
			onSuccess()
		} catch (error) {
			console.error('Update failed:', error)
		}
	}

	return {
		...formMethods,
		onSubmit: formMethods.handleSubmit(onSubmit),
		isSubmitting: formMethods.formState.isSubmitting,
		errors: formMethods.formState.errors,
	}
}
