import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { convertToSoloProject, convertToTeamProject, updateProject } from '@/lib/projects/projects'
import { useProject } from '@/shared/context/project-context'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { Project } from '@/shared/types/project'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface useUpdateProjectProps {
	project: Project
	onSuccess: () => void
}

export const useUpdateProject = ({ project, onSuccess }: useUpdateProjectProps) => {
	const { updateProjectState } = useProject()
	const queryClient = useQueryClient()

	const [isSoloConfirmOpen, setIsSoloConfirmOpen] = useState(false)
	const [pendingData, setPendingData] = useState<ProjectFormValues | null>(null)

	const formMethods = useForm<ProjectFormValues>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: project.title,
			description: project.description ?? '',
			type: project.type,
			color: project.color || CALENDAR_COLORS.GOLD,
		},
	})

	const executeUpdate = async (data: ProjectFormValues, deleteTeamData?: boolean) => {
		if (data.type === 'team' && project.type === 'solo') {
			const updatedDoc = await convertToTeamProject(project.$id, project.ownerId, data.title)
			updateProjectState(updatedDoc as unknown as Project)
			return updatedDoc
		} else if (data.type === 'solo' && project.type === 'team' && deleteTeamData !== undefined) {
			const updatedDoc = await convertToSoloProject(project.$id, project.ownerId, deleteTeamData, data)
			updateProjectState(updatedDoc as unknown as Project)
			return updatedDoc
		} else {
			await updateProject(project.$id, data)
			updateProjectState(data)
		}
	}

	const onSubmit = async (data: ProjectFormValues) => {
		if (data.type === 'solo' && project.type === 'team') {
			setPendingData(data)
			setIsSoloConfirmOpen(true)
			return
		}

		const updateAction = executeUpdate(data)

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

	const handleSoloConfirm = async (deleteTeamData: boolean) => {
		if (!pendingData) return
		setIsSoloConfirmOpen(false)

		const updateAction = executeUpdate(pendingData, deleteTeamData)

		toast.promise(updateAction, {
			loading: 'Converting to solo project...',
			success: 'Project converted to solo mode',
			error: 'Failed to convert project',
		})

		try {
			await updateAction
			if (deleteTeamData) {
				queryClient.invalidateQueries({ queryKey: ['chat-channels', project.$id] })
			}
			setPendingData(null)
			onSuccess()
		} catch (error) {
			console.error('Conversion failed:', error)
		}
	}

	return {
		...formMethods,
		onSubmit: formMethods.handleSubmit(onSubmit),
		isSubmitting: formMethods.formState.isSubmitting,
		errors: formMethods.formState.errors,
		isSoloConfirmOpen,
		setIsSoloConfirmOpen,
		handleSoloConfirm,
	}
}
