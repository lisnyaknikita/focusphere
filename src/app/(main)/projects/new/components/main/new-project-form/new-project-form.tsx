import { useProjectOperations } from '@/shared/hooks/projects/use-create-project'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import classes from './new-project-form.module.scss'

export const NewProjectForm = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const projectId = searchParams.get('projectId')

	const {
		register,
		handleSubmit,
		control,
		setFocus,
		reset,
		formState: { errors },
	} = useForm<ProjectFormValues>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: '',
			type: undefined,
		},
	})

	const { project, isFetching, createProject, isCreating, updateProject, isUpdating } = useProjectOperations(projectId)

	useEffect(() => {
		if (project) {
			reset({
				title: project.title,
				type: project.type,
			})
		}
	}, [project, reset])

	useEffect(() => {
		if (!projectId) setFocus('title')
	}, [setFocus, projectId])

	const handleNavigation = (id: string, type: 'solo' | 'team') => {
		if (type === 'team') {
			router.push(`/projects/new/team?projectId=${id}`)
		} else {
			router.push(`/projects/${id}/board`)
		}
	}

	const onSubmit = async (data: ProjectFormValues) => {
		try {
			if (projectId) {
				await updateProject(data)
				handleNavigation(projectId, data.type)
			} else {
				const newProject = await createProject(data)
				if (newProject) {
					handleNavigation(newProject.$id, data.type)
				}
			}
		} catch (err) {
			console.error('Project operation failed:', err)
		}
	}

	const isProcessing = isCreating || isUpdating || isFetching

	const getButtonText = () => {
		if (isProcessing) return 'Processing...'
		return projectId ? 'Save & Continue' : 'Create'
	}

	return (
		<form className={classes.newProjectForm} onSubmit={handleSubmit(onSubmit)}>
			<h3 className={classes.formTitle}>{projectId ? 'Edit project details' : 'Create new project'}</h3>
			<p className={classes.formSubtitle}>
				{projectId ? 'Adjust your project settings' : 'Start organizing your work efficiently'}
			</p>
			<div className={classes.titleLabel}>
				<span>Project title</span>
				<input type='text' placeholder='Enter your project name' {...register('title')} disabled={isProcessing} />
				{errors.title && <p className={classes.errorText}>{errors.title.message}</p>}
			</div>
			<div className={classes.projectTypeLabel}>
				<span>Project type</span>
				<Controller
					name='type'
					control={control}
					render={({ field }) => (
						<div className={classes.radioButtons}>
							<RadioCard
								value='solo'
								label='Solo project'
								checked={field.value === 'solo'}
								name='projectType'
								onChange={() => field.onChange('solo')}
							/>
							<RadioCard
								value='team'
								label='Team project'
								checked={field.value === 'team'}
								name='projectType'
								onChange={() => field.onChange('team')}
							/>
						</div>
					)}
				/>
				{errors.type && <p className={classes.errorText}>{errors.type.message}</p>}
			</div>
			<button className={classes.createButton} disabled={isProcessing}>
				{getButtonText()}
			</button>
		</form>
	)
}
