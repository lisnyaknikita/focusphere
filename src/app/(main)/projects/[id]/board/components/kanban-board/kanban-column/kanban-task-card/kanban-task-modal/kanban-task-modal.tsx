'use client'

import { useProject } from '@/shared/context/project-context'
import { useSubtasks } from '@/shared/hooks/projects/kanban-board/use-subtasks'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AssigneeSelect } from './components/assignee-select/assignee-select'
import { PriorityDropdown } from './components/priority-dropdown/priority-dropdown'
import { SubtaskTable } from './components/subtask-table/subtask-table'
import { TaskLabelsEditor } from './components/task-labels-editor/task-labels-editor'
import classes from './kanban-task-modal.module.scss'

interface KanbanTaskModalProps {
	task: KanbanTask
	onUpdate: (id: string, data: Partial<KanbanTask>) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export const KanbanTaskModal = ({ task, onUpdate, onDelete }: KanbanTaskModalProps) => {
	const [title, setTitle] = useState(task?.title)
	const [description, setDescription] = useState(task?.description || '')
	const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
	const [isBacklogConfirmOpen, setIsBacklogConfirmOpen] = useState(false)

	const { project, createNote } = useProject()
	const { subtasks, addSubtask, updateSubtask, deleteSubtask } = useSubtasks(task.$id)
	const router = useRouter()

	if (!task) return null

	const handleBlur = (field: keyof KanbanTask, value: string) => {
		if (value !== task[field]) {
			onUpdate(task.$id, { [field]: value })
		}
	}

	const handleAddSubtaskSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (newSubtaskTitle.trim() === '') return
		addSubtask(newSubtaskTitle.trim())
		setNewSubtaskTitle('')
	}

	const handleDeleteConfirm = async () => {
		await onDelete(task.$id)
		setIsDeleteConfirmOpen(false)
	}

	const handleBacklogConfirm = async () => {
		await onUpdate(task.$id, { status: 'backlog' })
		setIsBacklogConfirmOpen(false)
	}

	const handleCreateNote = async () => {
		const noteTitle = task.taskCode ? `${task.taskCode}: ${task.title}` : `Note: ${task.title}`

		try {
			await createNote(noteTitle, task.taskCode)
			router.push(`/projects/${project?.$id}/notes`)
		} catch (error) {
			console.error('Failed to create note from task:', error)
		}
	}

	return (
		<>
			<div className={classes.modalInner}>
				<div className={classes.taskContent}>
					{task.taskCode && <span className={classes.taskCodeBadge}>{task.taskCode}</span>}
					<input
						className={classes.titleInput}
						value={title}
						onChange={e => setTitle(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') e.currentTarget.blur()
						}}
						onBlur={() => handleBlur('title', title)}
					/>

					<label className={classes.descriptionSection}>
						<span>Description</span>
						<textarea
							placeholder='Add a description...'
							value={description}
							onChange={e => setDescription(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									e.currentTarget.blur()
								}
							}}
							onBlur={() => handleBlur('description', description)}
						/>
					</label>

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
								})
							}}
						/>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Priority</span>
						<PriorityDropdown
							value={task.priority || 'medium'}
							onChange={newPriority => onUpdate(task.$id, { priority: newPriority })}
						/>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Labels</span>
						<TaskLabelsEditor
							labels={task.labels || []}
							onChange={updatedLabels => onUpdate(task.$id, { labels: updatedLabels })}
						/>
					</div>

					<div className={classes.modalActions}>
						<button type='button' className={classes.noteButton} onClick={handleCreateNote}>
							Create Note
						</button>
						<button type='button' className={classes.backlogButton} onClick={() => setIsBacklogConfirmOpen(true)}>
							Move to Backlog
						</button>
						<button type='button' className={classes.deleteButton} onClick={() => setIsDeleteConfirmOpen(true)}>
							Delete Task
						</button>
					</div>
				</div>
			</div>

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
			<ConfirmModal
				isVisible={isBacklogConfirmOpen}
				onClose={() => setIsBacklogConfirmOpen(false)}
				onConfirm={handleBacklogConfirm}
				title='Move to Backlog'
				message={
					<>
						Are you sure you want to move task &quot;<span className='highlight'>{task.title}</span>&quot; to backlog?
					</>
				}
			/>
		</>
	)
}
