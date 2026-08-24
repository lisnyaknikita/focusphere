'use client'

import { Editor } from '@/app/(main)/projects/[id]/chat/components/chat-area/components/editor/editor'
import { useProject } from '@/shared/context/project-context'
import { useSubtasks } from '@/shared/hooks/projects/kanban-board/use-subtasks'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { ImagePreviewModal } from '@/shared/ui/image-preview-modal/image-preview-modal'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AssigneeSelect } from './components/assignee-select/assignee-select'
import { PriorityDropdown } from './components/priority-dropdown/priority-dropdown'
import { SubtaskTable } from './components/subtask-table/subtask-table'
import { TaskDueDate } from './components/task-due-date/task-due-date'
import { TaskLabelsEditor } from './components/task-labels-editor/task-labels-editor'
import classes from './kanban-task-modal.module.scss'

interface KanbanTaskModalProps {
	task: KanbanTask
	onUpdate: (id: string, data: Partial<KanbanTask>) => Promise<void>
	onDelete: (id: string) => Promise<void>
	onClose?: () => void
}

export const KanbanTaskModal = ({ task, onUpdate, onDelete, onClose }: KanbanTaskModalProps) => {
	const [title, setTitle] = useState(task?.title)
	const [isEditingDescription, setIsEditingDescription] = useState(false)
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
	const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

	const { project, createNote } = useProject()
	const { subtasks, addSubtask, updateSubtask, deleteSubtask } = useSubtasks(task.$id)
	const router = useRouter()

	useEffect(() => {
		if (task) {
			setTitle(task.title || '')
			setIsEditingDescription(false)
		}
	}, [task])

	if (!task) return null

	const handleTitleBlur = (value: string) => {
		const trimmedTitle = value.trim()

		if (!trimmedTitle) {
			toast.error('Task title cannot be empty')
			setTitle(task.title || '')
			return
		}

		if (trimmedTitle !== task.title) {
			setTitle(trimmedTitle)
			onUpdate(task.$id, { title: trimmedTitle }).catch((err: unknown) => {
				console.error(`Failed to update title:`, err)
				toast.error('Failed to update field')
				setTitle(task.title || '')
			})
		}
	}

	const handleDescriptionPreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement
		if (target.tagName === 'IMG') {
			const imgSrc = target.getAttribute('src')
			if (imgSrc) {
				setPreviewImageUrl(imgSrc)
				return
			}
		}
		setIsEditingDescription(true)
	}

	const handleAddSubtaskSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (newSubtaskTitle.trim() === '') return
		addSubtask(newSubtaskTitle.trim()).catch((err: unknown) => {
			console.error('Subtask submission failed:', err)
			toast.error('Subtask submission failed')
		})
		setNewSubtaskTitle('')
	}

	const handleDeleteConfirm = async () => {
		try {
			await onDelete(task.$id)
			setIsDeleteConfirmOpen(false)
			onClose?.()
		} catch (err: unknown) {
			console.error('Failed to delete task:', err)
			toast.error('Failed to delete task')
		}
	}

	const handleCreateNote = async () => {
		const noteTitle = task.taskCode ? `${task.taskCode}: ${task.title}` : `Note: ${task.title}`
		try {
			await createNote(noteTitle, task.taskCode)
			router.push(`/projects/${project?.$id}/notes`)
		} catch (err: unknown) {
			console.error('Failed to create note from task:', err)
			toast.error('Failed to create note from task')
		}
	}

	return (
		<>
			<div className={classes.modalInner}>
				{onClose && (
					<button className={classes.closeButton} onClick={onClose} aria-label='Close modal' type='button'>
						<CloseIcon width={20} height={20} />
					</button>
				)}
				<div className={classes.taskContent}>
					{task.taskCode && <span className={classes.taskCodeBadge}>{task.taskCode}</span>}
					<textarea
						className={classes.titleInput}
						value={title}
						rows={1}
						onChange={e => setTitle(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
								e.currentTarget.blur()
							}
						}}
						onBlur={() => handleTitleBlur(title)}
					/>

					<div className={classes.descriptionSection}>
						<span className={classes.descriptionLabel}>Description</span>
						{isEditingDescription ? (
							<Editor
								key={task.$id}
								variant='description'
								initialContent={task.description || ''}
								onSend={async newDescription => {
									if (newDescription !== task.description) {
										await onUpdate(task.$id, { description: newDescription }).catch((err: unknown) => {
											console.error('Failed to update task description:', err)
											toast.error('Failed to update description')
										})
									}
									setIsEditingDescription(false)
								}}
								onCancel={() => setIsEditingDescription(false)}
								tasks={[]}
							/>
						) : (
							<div className={classes.descriptionPreview} onClick={handleDescriptionPreviewClick}>
								{task.description ? (
									<div className='ql-editor' dangerouslySetInnerHTML={{ __html: task.description }} />
								) : (
									<span className={classes.descriptionPlaceholder}>Add a description...</span>
								)}
							</div>
						)}
					</div>

					<div className={classes.subtasksSection}>
						<div className={classes.subtasksHeader}>
							<h5>Subtasks</h5>
							<form onSubmit={handleAddSubtaskSubmit} className={classes.subtaskForm}>
								<input
									type='text'
									placeholder='Add a subtask...'
									value={newSubtaskTitle}
									onChange={e => setNewSubtaskTitle(e.target.value)}
								/>
								<button type='submit' aria-label='Add subtask'>
									<PlusIcon />
								</button>
							</form>
						</div>

						{subtasks.length > 0 ? (
							<SubtaskTable
								subtasks={subtasks}
								project={project}
								updateSubtask={updateSubtask}
								deleteSubtask={deleteSubtask}
							/>
						) : (
							<div className={classes.emptySubtasks}>
								<span>No subtasks created yet. Type above to add one.</span>
							</div>
						)}
					</div>
				</div>

				<div className={classes.taskDetails}>
					<div className={classes.detailItem}>
						<span className={classes.label}>Assignee</span>
						<AssigneeSelect
							teamId={project?.teamId}
							currentAssigneeId={task.assigneeId}
							currentAssigneeName={task.assigneeName}
							onAssigneeChange={(newUserId, newUserName) => {
								onUpdate(task.$id, {
									assigneeId: newUserId,
									assigneeName: newUserName,
								}).catch((err: unknown) => console.error(err))
							}}
						/>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Priority</span>
						<PriorityDropdown
							value={task.priority || 'medium'}
							onChange={newPriority => {
								onUpdate(task.$id, { priority: newPriority }).catch((err: unknown) => console.error(err))
							}}
						/>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Due Date</span>
						<TaskDueDate
							value={task.dueDate}
							onChange={nextDate => {
								onUpdate(task.$id, { dueDate: nextDate }).catch(err => console.error(err))
							}}
						/>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Labels</span>
						<TaskLabelsEditor
							labels={task.labels || []}
							onChange={updatedLabels => {
								onUpdate(task.$id, { labels: updatedLabels }).catch((err: unknown) => console.error(err))
							}}
						/>
					</div>

					<div className={classes.modalActions}>
						<button type='button' className={classes.noteButton} onClick={handleCreateNote}>
							Create Note
						</button>

						<button type='button' className={classes.deleteButton} onClick={() => setIsDeleteConfirmOpen(true)}>
							Delete Task
						</button>
					</div>
				</div>
			</div>

			<ImagePreviewModal src={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />

			<ConfirmModal
				isVisible={isDeleteConfirmOpen}
				onClose={() => setIsDeleteConfirmOpen(false)}
				onConfirm={handleDeleteConfirm}
				title='Delete Task'
				message={
					<>
						Are you sure you want to delete task &quot;<span className='highlight'>{task.title}</span>&quot;?
					</>
				}
			/>
		</>
	)
}
