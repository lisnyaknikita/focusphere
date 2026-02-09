import { getUserAvatar } from '@/lib/appwrite'
import { KanbanTask, TaskPriority } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import Image from 'next/image'
import { useState } from 'react'
import classes from './kanban-task-modal.module.scss'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

interface KanbanTaskModalProps {
	task: KanbanTask
	onUpdate: (id: string, data: Partial<KanbanTask>) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export const KanbanTaskModal = ({ task, onUpdate, onDelete }: KanbanTaskModalProps) => {
	const [title, setTitle] = useState(task?.title)
	const [description, setDescription] = useState(task?.description || '')
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

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
						<div className={classes.assignee}>
							<Image src={getUserAvatar(task.assigneeName)} alt='avatar' width={24} height={24} />
							<span>{task.assigneeName}</span>
						</div>
					</div>

					<div className={classes.detailItem}>
						<span className={classes.label}>Priority</span>
						<select
							className={classes.prioritySelect}
							value={task.priority || 'medium'}
							onChange={e => onUpdate(task.$id, { priority: e.target.value as TaskPriority })}
						>
							{PRIORITIES.map(p => (
								<option key={p} value={p}>
									{p.charAt(0).toUpperCase() + p.slice(1)}
								</option>
							))}
						</select>
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
