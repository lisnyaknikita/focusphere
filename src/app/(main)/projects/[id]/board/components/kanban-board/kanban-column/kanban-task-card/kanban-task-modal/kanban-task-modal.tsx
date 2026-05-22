'use client'

import { useProject } from '@/shared/context/project-context'
import { useSubtasks } from '@/shared/hooks/projects/kanban-board/use-subtasks'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { getLabelColor } from '@/shared/utils/get-label-color/get-label-color'
import { useState } from 'react'
import { AssigneeSelect } from './components/assignee-select/assignee-select'
import { PriorityDropdown } from './components/priority-dropdown/priority-dropdown'
import { SubtaskTable } from './components/subtask-table/subtask-table'
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
	const [newLabelInput, setNewLabelInput] = useState('')
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

	const { project } = useProject()
	const { subtasks, addSubtask, updateSubtask, deleteSubtask } = useSubtasks(task.$id)

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

	const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			const val = newLabelInput.trim().replace(/,/g, '')
			if (val) {
				const currentLabels = task.labels || []
				if (!currentLabels.includes(val)) {
					const updatedLabels = [...currentLabels, val]
					onUpdate(task.$id, { labels: updatedLabels as string[] })
				}
			}
			setNewLabelInput('')
		}
	}

	const handleRemoveLabel = (labelToRemove: string) => {
		const currentLabels = task.labels || []
		const updatedLabels = currentLabels.filter(l => l !== labelToRemove)
		onUpdate(task.$id, { labels: updatedLabels as string[] })
	}

	const handleDeleteConfirm = async () => {
		await onDelete(task.$id)
		setIsDeleteConfirmOpen(false)
	}

	return (
		<>
			<div className={classes.modalInner}>
				<div className={classes.taskContent}>
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
						<div className={classes.labelsEditor}>
							{(!task.labels || task.labels.length === 0) && (
								<span className={classes.emptyLabelsText}>No labels yet</span>
							)}
							{task.labels && task.labels.length > 0 && (
								<div className={classes.labelsList}>
									{(task.labels || []).map(label => {
										const color = getLabelColor(label)
										return (
											<span
												key={label}
												className={classes.modalLabelTag}
												style={{
													borderColor: color,
												}}
											>
												{label}
												<button
													type='button'
													onClick={() => handleRemoveLabel(label)}
													className={classes.removeLabelBtn}
													title='Remove label'
												>
													&times;
												</button>
											</span>
										)
									})}
								</div>
							)}

							<input
								type='text'
								placeholder='Add label...'
								value={newLabelInput}
								onChange={e => setNewLabelInput(e.target.value)}
								onKeyDown={handleLabelKeyDown}
								className={classes.labelInput}
							/>
						</div>
					</div>

					<button className={classes.deleteButton} onClick={() => setIsDeleteConfirmOpen(true)}>
						Delete Task
					</button>
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
		</>
	)
}
