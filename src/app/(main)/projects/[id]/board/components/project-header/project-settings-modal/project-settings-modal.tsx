'use client'

import { useDeleteProject } from '@/shared/hooks/projects/use-delete-project'
import { useUpdateProject } from '@/shared/hooks/projects/use-update-project'
import { Project } from '@/shared/types/project'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import classes from './project-settings-modal.module.scss'

interface ProjectSettingsModalProps {
	project: Project
	onClose: () => void
}

export const ProjectSettingsModal = ({ project, onClose }: ProjectSettingsModalProps) => {
	const { register, control, onSubmit, isSubmitting, errors } = useUpdateProject({ project, onSuccess: onClose })
	const { remove, isDeleting } = useDeleteProject()

	const router = useRouter()

	const handleDelete = async () => {
		await remove(project.$id, () => {
			onClose()
			router.push('/projects')
			router.refresh()
		})
	}

	return (
		<form className={classes.settingsForm} onSubmit={onSubmit}>
			<h3 className={classes.title}>Project Settings</h3>
			<label className={classes.field}>
				<span>Project title</span>
				<input type='text' {...register('title')} disabled={isSubmitting || isDeleting} />
				{errors.title && <p className={classes.errorText}>{errors.title.message}</p>}
			</label>
			<label className={classes.field}>
				<span>Description</span>
				<textarea
					{...register('description')}
					placeholder='Add a short description...'
					disabled={isSubmitting || isDeleting}
				/>
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
			<div className={classes.buttons}>
				<button className={classes.saveButton} disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</button>
				<button
					type='button'
					className={classes.deleteButton}
					onClick={handleDelete}
					disabled={isDeleting || isSubmitting}
				>
					{isDeleting ? 'Deleting...' : 'Delete project'}
				</button>
			</div>
		</form>
	)
}
