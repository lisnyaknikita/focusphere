import { updateProject } from '@/lib/projects/projects'
import { useProject } from '@/shared/context/project-context'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { Project } from '@/shared/types/project'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
		},
	})

	const onSubmit = async (data: ProjectFormValues) => {
		try {
			await updateProject(project.$id, data)
			updateProjectState(data)
			onSuccess()
		} catch (error) {
			console.error('Failed to update project:', error)
		}
	}

	return {
		...formMethods,
		onSubmit: formMethods.handleSubmit(onSubmit),
		isSubmitting: formMethods.formState.isSubmitting,
		errors: formMethods.formState.errors,
	}
}
