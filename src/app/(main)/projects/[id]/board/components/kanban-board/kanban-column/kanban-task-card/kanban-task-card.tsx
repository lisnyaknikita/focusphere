'use client'

import { OwnerAvatar } from '@/app/(main)/projects/components/main/projects-list/project-card/components/owner-avatar/owner-avatar'
import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { Modal } from '@/shared/ui/modal/modal'
import { getLabelColor } from '@/shared/utils/get-label-color/get-label-color'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import classes from './kanban-task-card.module.scss'
import { KanbanTaskModal } from './kanban-task-modal/kanban-task-modal'

const priorityColors = {
	low: '#A3A3A3',
	medium: '#FBBF24',
	high: '#F97316',
	urgent: '#DC2626',
}

interface KanbanTaskCardProps {
	task: KanbanTask
	isOverlay?: boolean
	onUpdateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	onDeleteTask: (taskId: string) => Promise<void>
}

export const KanbanTaskCard = ({ task, onUpdateTask, onDeleteTask, isOverlay }: KanbanTaskCardProps) => {
	const [isTaskModalVisible, setIsTaskModalVisible] = useState(false)
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.$id,
		disabled: isTaskModalVisible,
	})

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging && !isOverlay ? 0.3 : 1,
		zIndex: isDragging ? 999 : undefined,
		cursor: isDragging ? 'grabbing' : 'grab',
	}

	return (
		<>
			<li
				ref={setNodeRef}
				style={style}
				className={classes.taskCard}
				onClick={() => setIsTaskModalVisible(true)}
				{...attributes}
				{...listeners}
			>
				<div className={classes.taskContent}>
					<h4 className={classes.taskTitle}>{task.title}</h4>
					{task.labels && task.labels.length > 0 && (
						<ul className={classes.taskLabels}>
							{task.labels.map(label => {
								const color = getLabelColor(label)
								return (
									<li
										key={label}
										className={classes.labelTag}
										style={{
											borderColor: color,
										}}
									>
										{label}
									</li>
								)
							})}
						</ul>
					)}
					<footer className={classes.taskCardFooter}>
						<div className={classes.taskAssignee}>
							<OwnerAvatar userId={task.assigneeId || ''} size={20} />
							<span>{task.assigneeName}</span>
						</div>
						<span
							className={classes.priorityIndicator}
							style={{ backgroundColor: priorityColors[task.priority || 'medium'] }}
						/>
						<time className={classes.taskDate}>
							{new Date(task.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						</time>
					</footer>
				</div>
			</li>
			<Modal isVisible={isTaskModalVisible} onClose={() => setIsTaskModalVisible(false)}>
				<KanbanTaskModal
					task={task}
					onUpdate={onUpdateTask}
					onDelete={onDeleteTask}
					onClose={() => setIsTaskModalVisible(false)}
				/>
			</Modal>
		</>
	)
}
