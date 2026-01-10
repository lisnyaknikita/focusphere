'use client'

import { useUpdateProject } from '@/shared/hooks/projects/use-update-project'
import { Project } from '@/shared/types/project'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { Controller } from 'react-hook-form'
import classes from './project-settings-modal.module.scss'

interface ProjectSettingsModalProps {
	project: Project
	onClose: () => void
}

export const ProjectSettingsModal = ({ project, onClose }: ProjectSettingsModalProps) => {
	const { register, control, onSubmit, isSubmitting, errors } = useUpdateProject({ project, onSuccess: onClose })

	return (
		<form className={classes.settingsForm} onSubmit={onSubmit}>
			<h3 className={classes.title}>Project Settings</h3>
			<label className={classes.field}>
				<span>Project title</span>
				<input type='text' {...register('title')} disabled={isSubmitting} />
				{errors.title && <p className={classes.errorText}>{errors.title.message}</p>}
			</label>
			<label className={classes.field}>
				<span>Description</span>
				<textarea {...register('description')} placeholder='Add a short description...' disabled={isSubmitting} />
			</label>
			<div className={classes.radioField}>
				<label>Project type</label>
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
			<button className={classes.saveButton} disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</button>
		</form>
	)
}
