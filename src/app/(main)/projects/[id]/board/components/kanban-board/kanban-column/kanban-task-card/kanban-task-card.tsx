import { KanbanTask } from '@/shared/types/kanban-task'
import { useDraggable } from '@dnd-kit/core'
import Image from 'next/image'
import classes from './kanban-task-card.module.scss'

const priorityColors = {
	low: '#A3A3A3',
	medium: '#FBBF24',
	high: '#F97316',
	urgent: '#DC2626',
}

interface KanbanTaskCardProps {
	task: KanbanTask
}

export const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: task.$id,
	})

	const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

	return (
		<li ref={setNodeRef} {...attributes} {...listeners} style={style} className={classes.taskCard}>
			<h4 className={classes.taskTitle}>{task.title}</h4>
			<p className={classes.taskDescription}>{task.description}</p>
			<footer className={classes.taskCardFooter}>
				<div className={classes.taskAssignee}>
					<Image src={'/avatar.jpg'} alt='assignee' width={23} height={23} />
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
		</li>
	)
}
