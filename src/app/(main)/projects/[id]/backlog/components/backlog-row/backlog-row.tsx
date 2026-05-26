'use client'

import { KanbanTask } from '@/shared/types/kanban-task'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { getLabelColor } from '@/shared/utils/get-label-color/get-label-color'
import { useState } from 'react'
import classes from './backlog-row.module.scss'

const formatDate = (dateString: string) => {
	const date = new Date(dateString)
	const now = new Date()

	const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const diffTime = dNow.getTime() - dDate.getTime()
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

	if (diffDays === 0) return 'Today'
	if (diffDays === 1) return 'Yesterday'
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface BacklogRowProps {
	task: KanbanTask
	onUpdateTask: (taskId: string, data: Partial<KanbanTask>) => Promise<void>
	onMoveToTodo: (taskId: string) => Promise<void>
	onDeleteRequest: (task: KanbanTask) => void
}

export const BacklogRow = ({ task, onUpdateTask, onMoveToTodo, onDeleteRequest }: BacklogRowProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [title, setTitle] = useState(task.title)

	const handleBlur = async () => {
		setIsEditing(false)
		const trimmed = title.trim()

		if (trimmed !== '' && trimmed !== task.title) {
			await onUpdateTask(task.$id, { title: trimmed })
		} else {
			setTitle(task.title)
		}
	}

	return (
		<div className={classes.row}>
			<div className={classes.colTask}>
				<CircleIcon className={classes.circleIcon} />
				{isEditing ? (
					<input
						type='text'
						className={classes.inlineTaskInput}
						value={title}
						onChange={e => setTitle(e.target.value)}
						onBlur={handleBlur}
						onKeyDown={e => {
							if (e.key === 'Enter') e.currentTarget.blur()
							if (e.key === 'Escape') {
								setTitle(task.title)
								setIsEditing(false)
							}
						}}
						autoFocus
					/>
				) : (
					<span className={classes.taskTitleText} onClick={() => setIsEditing(true)} title='Click to edit'>
						{task.title}
					</span>
				)}
			</div>
			<div className={classes.colTags}>
				{task.labels && task.labels.length > 0 ? (
					<ul className={classes.labelsList}>
						{task.labels.map(label => {
							const color = getLabelColor(label)
							return (
								<li key={label} className={classes.labelTag} style={{ borderColor: color }}>
									{label}
								</li>
							)
						})}
					</ul>
				) : (
					<span className={classes.emptyValue}>—</span>
				)}
			</div>
			<div className={classes.colAdded}>
				<span className={classes.dateText}>{formatDate(task.$createdAt)}</span>
			</div>
			<div className={classes.colAction}>
				<button className={classes.moveToTodoBtn} onClick={() => onMoveToTodo(task.$id)}>
					→ To Do
				</button>
				<button className={classes.deleteTaskBtn} onClick={() => onDeleteRequest(task)} title='Delete task'>
					<DeleteIcon width={14} height={14} />
				</button>
			</div>
		</div>
	)
}
