import { useCreateTask } from '@/shared/hooks/projects/kanban-board/use-create-task'
import { Column } from '@/shared/types/kanban'
import { CreateKanbanTaskPayload, KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { useDroppable } from '@dnd-kit/core'
import classes from './kanban-column.module.scss'
import { KanbanTaskCard } from './kanban-task-card/kanban-task-card'

interface KanbanColumnProps {
	column: Column
	tasks: KanbanTask[]
	listHeight: number
	onAddTask: (title: string, status: TaskStatus) => Promise<void>
	onUpdateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	onDeleteTask: (taskId: string) => Promise<void>
}

export const KanbanColumn = ({
	column,
	tasks,
	listHeight,
	onAddTask,
	onUpdateTask,
	onDeleteTask,
}: KanbanColumnProps) => {
	const { isAdding, title, setTitle, handleAddSubmit, setIsAdding, isSubmitting } = useCreateTask({ onAddTask, column })

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
						<KanbanTaskCard key={task.$id} task={task} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
					))}
					{isAdding && (
						<li className={classes.inlineItem}>
							<textarea
								autoFocus
								placeholder='Task name...'
								value={title}
								onChange={e => setTitle(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault()
										handleAddSubmit()
									}
									if (e.key === 'Escape') {
										setIsAdding(false)
										setTitle('')
									}
								}}
								onBlur={() => {
									if (!title.trim()) setIsAdding(false)
								}}
								disabled={isSubmitting}
							/>
						</li>
					)}
				</ul>
				{!isAdding && (
					<button className={classes.createButton} onClick={() => setIsAdding(true)}>
						<PlusIcon />
						<span>Create</span>
					</button>
				)}
			</div>
		</div>
	)
}
