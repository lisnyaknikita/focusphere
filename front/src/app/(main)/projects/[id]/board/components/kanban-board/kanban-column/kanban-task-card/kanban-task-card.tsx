import { Task } from '@/shared/types/kanban'
import { useDraggable } from '@dnd-kit/core'
import Image from 'next/image'
import classes from './kanban-task-card.module.scss'

interface KanbanTaskCardProps {
	task: Task
}

export const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: task.id,
	})

	const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

	return (
		<li ref={setNodeRef} {...attributes} {...listeners} style={style} className={classes.taskCard}>
			<h4 className={classes.taskTitle}>{task.title}</h4>
			<p className={classes.taskDescription}>{task.description}</p>
			<footer className={classes.taskCardFooter}>
				<div className={classes.taskAssignee}>
					<Image src={'/avatar.jpg'} alt='assignee' width={23} height={23} />
					<span>{task.assignee}</span>
				</div>
				<div className={classes.taskDate}>{task.createdAt}</div>
			</footer>
		</li>
	)
}
