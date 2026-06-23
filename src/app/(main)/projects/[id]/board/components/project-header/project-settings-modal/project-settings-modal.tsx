'use client'

import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { useBilling } from '@/shared/context/billing-context'
import { useDeleteProject } from '@/shared/hooks/projects/use-delete-project'
import { useUpdateProject } from '@/shared/hooks/projects/use-update-project'
import { Project } from '@/shared/types/project'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { BeatLoader } from 'react-spinners'
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
	const [isUserLoading, setIsUserLoading] = useState(true)

	const { isPro, openPaywall } = useBilling()

	const router = useRouter()
	const isOwner = currentUserId ? currentUserId === project.ownerId : false

	useEffect(() => {
		getCurrentUserId()
			.then(id => setCurrentUserId(id))
			.catch(err => console.error('Failed to get user ID:', err))
			.finally(() => setIsUserLoading(false))
	}, [])

	const handleConfirmDelete = async () => {
		await remove(project.$id, () => {
			onClose()
			router.push('/projects')
			router.refresh()
		})
	}

	if (isUserLoading) {
		return <BeatLoader color='#aaa' size={10} className={classes.loader} />
	}

	const renderOwnerButtons = () => (
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
	)

	return (
		<>
			<form className={classes.settingsForm} onSubmit={onSubmit}>
				<div className={classes.projectInfo}>
					{isOwner && <h3 className={classes.title}>Project Settings</h3>}
					{isOwner ? (
						<>
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
								{errors.description && <p className={classes.errorText}>{errors.description.message}</p>}
							</label>
							<div className={classes.radioField}>
								<div className={classes.colorField}>
									<label>Project color</label>
									<Controller
										name='color'
										control={control}
										render={({ field }) => (
											<div className={classes.colorPickerContainer}>
												{Object.values(CALENDAR_COLORS).map(color => (
													<button
														key={color}
														type='button'
														className={clsx(classes.colorOption, field.value === color && classes.active)}
														style={{ backgroundColor: color }}
														onClick={() => field.onChange(color)}
													>
														{field.value === color && (
															<svg
																width='12'
																height='12'
																viewBox='0 0 12 12'
																fill='none'
																xmlns='http://www.w3.org/2000/svg'
															>
																<path
																	d='M2 6L5 9L10 3'
																	stroke='white'
																	strokeWidth='2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
															</svg>
														)}
													</button>
												))}
											</div>
										)}
									/>
								</div>
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
												isLocked={!isPro}
												onChange={() => {
													if (!isPro) {
														openPaywall('projects_team')
														return
													}
													field.onChange('team')
												}}
											/>
										</div>
									)}
								/>
								{errors.type && <p className={classes.errorText}>{errors.type.message}</p>}
							</div>
						</>
					) : (
						<div className={classes.readOnlyContainer}>
							<div className={classes.readOnlyRow}>
								<span className={classes.readOnlyLabel}>Title</span>
								<span className={classes.readOnlyValue}>{project.title}</span>
							</div>
							<div className={classes.readOnlyDescriptionBlock}>
								<span className={classes.readOnlyLabel}>Description</span>
								<div className={classes.descriptionText}>
									{project.description ? (
										project.description
									) : (
										<span className={classes.readOnlyEmpty}>No description provided</span>
									)}
								</div>
							</div>
							<div className={classes.readOnlyRow}>
								<span className={classes.readOnlyLabel}>Color</span>
								<div className={classes.readOnlyColor} style={{ backgroundColor: project.color }} />
							</div>
							<div className={classes.readOnlyRow} style={{ borderBottom: 'none' }}>
								<span className={classes.readOnlyLabel}>Type</span>
								<span className={classes.readOnlyValue}>
									{project.type === 'team' ? 'Team project' : 'Solo project'}
								</span>
							</div>
						</div>
					)}
					{!isOwner && (
						<button type='button' className={classes.saveButton} onClick={onClose} style={{ marginLeft: 'auto' }}>
							Close
						</button>
					)}
					{project.type === 'solo' && isOwner && <div className={classes.buttons}>{renderOwnerButtons()}</div>}
				</div>
				{project.type === 'team' && project.teamId && isOwner && (
					<div className={classes.invitationBlock}>
						<ProjectMembersSettings teamId={project.teamId} projectId={project.$id} />
						<div className={classes.buttons}>
							{isOwner ? (
								renderOwnerButtons()
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
