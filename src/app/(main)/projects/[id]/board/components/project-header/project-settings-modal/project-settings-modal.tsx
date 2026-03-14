'use client'

import { useDeleteProject } from '@/shared/hooks/projects/use-delete-project'
import { useUpdateProject } from '@/shared/hooks/projects/use-update-project'
import { Project } from '@/shared/types/project'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { ProjectMembersSettings } from './components/project-members-settings/project-members-settings'
import classes from './project-settings-modal.module.scss'

interface ProjectSettingsModalProps {
	project: Project
	onClose: () => void
}

export const ProjectSettingsModal = ({ project, onClose }: ProjectSettingsModalProps) => {
	const { register, control, onSubmit, isSubmitting, errors } = useUpdateProject({ project, onSuccess: onClose })
	const { remove, isDeleting } = useDeleteProject()
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)

	const router = useRouter()
	const isOwner = currentUserId ? currentUserId === project.ownerId : false

	useEffect(() => {
		getCurrentUserId()
			.then(id => setCurrentUserId(id))
			.catch(err => console.error('Failed to get user ID:', err))
	}, [])

	const handleConfirmDelete = async () => {
		await remove(project.$id, () => {
			onClose()
			router.push('/projects')
			router.refresh()
		})
	}

	return (
		<>
			<form className={classes.settingsForm} onSubmit={onSubmit}>
				<div className={classes.projectInfo}>
					<h3 className={classes.title}>Project Settings</h3>
					<label className={classes.field}>
						<span>Project title</span>
						<input type='text' {...register('title')} disabled={!isOwner || isSubmitting || isDeleting} />
						{errors.title && <p className={classes.errorText}>{errors.title.message}</p>}
					</label>
					<label className={classes.field}>
						<span>Description</span>
						<textarea
							{...register('description')}
							placeholder='Add a short description...'
							disabled={!isOwner || isSubmitting || isDeleting}
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
										disabled={!isOwner}
										onChange={() => field.onChange('solo')}
									/>
									<RadioCard
										value='team'
										label='Team project'
										checked={field.value === 'team'}
										name='projectType'
										disabled={!isOwner}
										onChange={() => field.onChange('team')}
									/>
								</div>
							)}
						/>
						{errors.type && <p className={classes.errorText}>{errors.type.message}</p>}
					</div>
					{!isOwner && (
						<button type='button' className={classes.saveButton} onClick={onClose} style={{ marginLeft: 'auto' }}>
							Close
						</button>
					)}
				</div>
				{project.type === 'team' && project.teamId && isOwner && (
					<div className={classes.invitationBlock}>
						<ProjectMembersSettings teamId={project.teamId} projectId={project.$id} />
						<div className={classes.buttons}>
							{isOwner ? (
								<>
									<button className={classes.saveButton} disabled={isSubmitting}>
										{isSubmitting ? 'Saving...' : 'Save Changes'}
									</button>
									<button
										type='button'
										className={classes.deleteButton}
										onClick={() => setIsDeleteConfirmOpen(true)}
										disabled={isDeleting || isSubmitting}
									>
										{isDeleting ? 'Deleting...' : 'Delete project'}
									</button>
								</>
							) : (
								<button type='button' className={classes.saveButton} onClick={onClose}>
									Close
								</button>
							)}
						</div>
					</div>
				)}
			</form>
			<ConfirmModal
				isVisible={isDeleteConfirmOpen}
				onClose={() => setIsDeleteConfirmOpen(false)}
				onConfirm={handleConfirmDelete}
				title='Delete Project'
				message={
					<>
						Are you sure you want to delete project &quot;<span className='highlight'>{project.title}</span>&quot;? This
						action cannot be undone.
					</>
				}
			/>
		</>
	)
}
