'use client'

import { getUserAvatar } from '@/lib/appwrite'
import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { DragHandleIcon } from '@/shared/ui/icons/projects/drag-handle-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
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
	}

	return (
		<>
			<li ref={setNodeRef} style={style} className={classes.taskCard} onClick={() => setIsTaskModalVisible(true)}>
				<div className={classes.taskContent}>
					<h4 className={classes.taskTitle}>{task.title}</h4>
					<p className={classes.taskDescription}>{task.description}</p>
					<footer className={classes.taskCardFooter}>
						<div className={classes.taskAssignee}>
							<Image src={getUserAvatar(task.assigneeName)} alt={task.assigneeName} width={20} height={20} />
							<span>{task.assigneeName}</span>
						</div>
						<span
							className={classes.priorityIndicator}
							style={{ backgroundColor: priorityColors[task.priority || 'medium'] }}
						/>
						<div className={classes.taskDate}>
							{new Date(task.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						</div>
					</footer>
				</div>
				<div className={classes.dragHandle} {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
					<button>
						<DragHandleIcon />
					</button>
				</div>
			</li>
			<Modal isVisible={isTaskModalVisible} onClose={() => setIsTaskModalVisible(false)}>
				<KanbanTaskModal task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
			</Modal>
		</>
	)
}
