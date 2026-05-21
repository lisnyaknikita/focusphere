import { useProject } from '@/shared/context/project-context'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { useState } from 'react'
import { AssigneeSelect } from './components/assignee-select/assignee-select'
import { PriorityDropdown } from './components/priority-dropdown/priority-dropdown'
import classes from './kanban-task-modal.module.scss'

interface KanbanTaskModalProps {
	task: KanbanTask
	onUpdate: (id: string, data: Partial<KanbanTask>) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export const KanbanTaskModal = ({ task, onUpdate, onDelete }: KanbanTaskModalProps) => {
	const [title, setTitle] = useState(task?.title)
	const [description, setDescription] = useState(task?.description || '')
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

	const { project } = useProject()

	if (!task) return null

	const handleBlur = (field: keyof KanbanTask, value: string) => {
		if (value !== task[field]) {
			onUpdate(task.$id, { [field]: value })
		}
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
							if (e.key === 'Enter') {
								e.currentTarget.blur()
							}
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
