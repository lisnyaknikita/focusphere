'use client'

import { KanbanTaskModal } from '@/app/(main)/projects/[id]/board/components/kanban-board/kanban-column/kanban-task-card/kanban-task-modal/kanban-task-modal'
import { KanbanTask } from '@/shared/types/kanban-task'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { GripIcon } from '@/shared/ui/icons/projects/grip-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { getLabelColor } from '@/shared/utils/get-label-color/get-label-color'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import classes from './backlog-row.module.scss'

const formatDate = (dateString: string) => {
	if (!dateString) return ''
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
	onDeleteRequest: (task: KanbanTask) => void
	onDeleteTask?: (taskId: string) => Promise<void>
}

export const BacklogRow = ({ task, onUpdateTask, onDeleteRequest, onDeleteTask }: BacklogRowProps) => {
	const [isTaskModalVisible, setIsTaskModalVisible] = useState(false)

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.$id,
		disabled: isTaskModalVisible,
		data: { type: 'Task', task },
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
	}

	const isDone = task.status === 'done'

	const handleDelete = async (id: string) => {
		if (onDeleteTask) {
			await onDeleteTask(id)
		} else {
			onDeleteRequest(task)
		}
		setIsTaskModalVisible(false)
	}

	return (
		<>
			<div
				ref={setNodeRef}
				style={style}
				className={classes.row}
				onClick={() => setIsTaskModalVisible(true)}
			>
				<div className={classes.colTask}>
					<button
						type='button'
						className={classes.dragHandle}
						onClick={e => e.stopPropagation()}
						{...attributes}
						{...listeners}
						title='Drag to reorder/move'
					>
						<GripIcon />
					</button>
					{isDone ? (
						<svg
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
							className={classes.circleIconDone}
						>
							<title>Done</title>
							<circle cx='12' cy='12' r='9' fill='#22c55e' />
							<path d='M8 12l3 3 5-5' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
						</svg>
					) : (
						<CircleIcon className={classes.circleIcon} />
					)}
					<span
						className={`${classes.taskTitleText} ${isDone ? classes.taskTitleDone : ''}`}
						title={task.title}
					>
						{task.title}
					</span>
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
					<button
						type='button'
						className={classes.deleteTaskBtn}
						onClick={e => {
							e.stopPropagation()
							onDeleteRequest(task)
						}}
						title='Delete task'
					>
						<DeleteIcon width={14} height={14} />
					</button>
				</div>
			</div>

			<Modal isVisible={isTaskModalVisible} onClose={() => setIsTaskModalVisible(false)}>
				<KanbanTaskModal
					task={task}
					onUpdate={async (id, data) => {
						await onUpdateTask(id, data)
					}}
					onDelete={handleDelete}
					onClose={() => setIsTaskModalVisible(false)}
				/>
			</Modal>
		</>
	)
}
