import { getProjectById, updateProject } from '@/lib/projects/projects'
import { useCreateProject } from '@/shared/hooks/projects/use-create-project'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import classes from './new-project-form.module.scss'

export const NewProjectForm = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { create, isLoading: isCreating } = useCreateProject()

	const projectId = searchParams.get('projectId')
	const [isFetching, setIsFetching] = useState(!!projectId)

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

	useEffect(() => {
		if (projectId) {
			const fetchProjectData = async () => {
				try {
					const project = await getProjectById(projectId)
					reset({
						title: project.title,
						type: project.type,
					})
				} catch (error) {
					console.error('Failed to load project:', error)
				} finally {
					setIsFetching(false)
				}
			}
			fetchProjectData()
		}
	}, [projectId, reset])

	const onSubmit = async (data: ProjectFormValues) => {
		if (projectId) {
			try {
				await updateProject(projectId, data)
				if (data.type === 'team') {
					router.push(`/projects/new/team?projectId=${projectId}`)
				} else {
					router.push(`/projects/${projectId}/board`)
				}
			} catch (err) {
				console.error('Update failed:', err)
			}
		} else {
			create(data, newId => {
				if (data.type === 'team') {
					router.push(`/projects/new/team?projectId=${newId}`)
				} else {
					router.push(`/projects/${newId}/board`)
				}
			})
		}
	}

	useEffect(() => {
		if (!projectId) setFocus('title')
	}, [setFocus, projectId])

	const isLoading = isCreating || isFetching

	return (
		<form className={classes.newProjectForm} onSubmit={handleSubmit(onSubmit)}>
			<h3 className={classes.formTitle}>{projectId ? 'Edit project details' : 'Create new project'}</h3>
			<p className={classes.formSubtitle}>
				{projectId ? 'Adjust your project settings' : 'Start organizing your work efficiently'}
			</p>
			<div className={classes.titleLabel}>
				<span>Project title</span>
				<input type='text' placeholder='Enter your project name' {...register('title')} disabled={isLoading} />
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
			<button className={classes.createButton} disabled={isLoading}>
				{isLoading ? 'Processing...' : projectId ? 'Save & Continue' : 'Create'}
			</button>
		</form>
	)
}
