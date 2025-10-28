import { Column, Task } from '@/shared/types/kanban'
import { useDroppable } from '@dnd-kit/core'
import classes from './kanban-column.module.scss'
import { KanbanTaskCard } from './kanban-task-card/kanban-task-card'

interface KanbanColumnProps {
	column: Column
	tasks: Task[]
	listHeight: number
}

export const KanbanColumn = ({ column, tasks, listHeight }: KanbanColumnProps) => {
	const { setNodeRef } = useDroppable({ id: column.id })

	return (
		<div className={classes.column} ref={setNodeRef}>
			<header className={classes.columnHeader}>
				<span className={classes.icon} />
				<h3 className={classes.columnTitle}>{column.title}</h3>
				<div className={classes.tasksCounter}>{tasks.length}</div>
			</header>
			<div className={classes.scrollWrapper} style={{ maxHeight: `${listHeight}px` }}>
				<ul className={classes.tasksList}>
					{tasks.map(task => (
						<KanbanTaskCard key={task.id} task={task} />
					))}
				</ul>
			</div>
		</div>
	)
}
