'use client'

import { getUserAvatar } from '@/lib/appwrite'
import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { Modal } from '@/shared/ui/modal/modal'
import { useDraggable } from '@dnd-kit/core'
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
	onUpdateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	onDeleteTask: (taskId: string) => Promise<void>
}

export const KanbanTaskCard = ({ task, onUpdateTask, onDeleteTask }: KanbanTaskCardProps) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: task.$id,
	})
	const [isTaskModalVisible, setIsTaskModalVisible] = useState(false)

	const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

	return (
		<>
			<li ref={setNodeRef} style={style} className={classes.taskCard} onClick={() => setIsTaskModalVisible(true)}>
				<div className={classes.taskContent}>
					<h4 className={classes.taskTitle}>{task.title}</h4>
					<p className={classes.taskDescription}>{task.description}</p>
					<footer className={classes.taskCardFooter}>
						<div className={classes.taskAssignee}>
							<Image src={getUserAvatar(task.assigneeName)} alt={task.assigneeName} width={23} height={23} />
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
				<div className={classes.dragHandle} {...attributes} {...listeners}>
					<button>
						<svg width='10' height='16' viewBox='0 0 16 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M13 6C11.346 6 10 4.654 10 3C10 1.346 11.346 0 13 0C14.654 0 16 1.346 16 3C16 4.654 14.654 6 13 6ZM13 24C11.346 24 10 22.654 10 21C10 19.346 11.346 18 13 18C14.654 18 16 19.346 16 21C16 22.654 14.654 24 13 24ZM13 15C11.346 15 10 13.654 10 12C10 10.346 11.346 9 13 9C14.654 9 16 10.346 16 12C16 13.654 14.654 15 13 15ZM3 6C1.346 6 0 4.654 0 3C0 1.346 1.346 0 3 0C4.654 0 6 1.346 6 3C6 4.654 4.654 6 3 6ZM3 24C1.346 24 0 22.654 0 21C0 19.346 1.346 18 3 18C4.654 18 6 19.346 6 21C6 22.654 4.654 24 3 24ZM3 15C1.346 15 0 13.654 0 12C0 10.346 1.346 9 3 9C4.654 9 6 10.346 6 12C6 13.654 4.654 15 3 15Z'
								fill='var(--text)'
							/>
						</svg>
					</button>
				</div>
			</li>
			<Modal isVisible={isTaskModalVisible} onClose={() => setIsTaskModalVisible(false)}>
				<KanbanTaskModal task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
			</Modal>
		</>
	)
}
