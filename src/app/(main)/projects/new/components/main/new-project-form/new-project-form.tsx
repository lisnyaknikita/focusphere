import { useCreateProject } from '@/shared/hooks/projects/use-create-project'
import { ProjectFormValues, projectSchema } from '@/shared/schemas/project-schema'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import classes from './new-project-form.module.scss'

export const NewProjectForm = () => {
	const router = useRouter()
	const { create, isLoading, error } = useCreateProject()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<ProjectFormValues>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			title: '',
			type: undefined,
		},
	})

	const onSubmit = (data: ProjectFormValues) => {
		create(data, projectId => {
			if (data.type === 'team') {
				router.push(`/projects/new/team?projectId=${projectId}`)
			} else {
				router.push(`/projects/${projectId}/board`)
			}
		})
	}

	return (
		<form className={classes.newProjectForm} onSubmit={handleSubmit(onSubmit)}>
			<h3 className={classes.formTitle}>Create new project</h3>
			<p className={classes.formSubtitle}>Start organizing your work efficiently</p>
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
				{isLoading ? 'Creating...' : 'Create'}
			</button>
		</form>
	)
}
