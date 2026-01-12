import { Column } from '@/shared/types/kanban'
import { KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { useDroppable } from '@dnd-kit/core'
import { useState } from 'react'
import classes from './kanban-column.module.scss'
import { KanbanTaskCard } from './kanban-task-card/kanban-task-card'

interface KanbanColumnProps {
	column: Column
	tasks: KanbanTask[]
	listHeight: number
	onAddTask: (title: string, status: TaskStatus) => Promise<void>
}

export const KanbanColumn = ({ column, tasks, listHeight, onAddTask }: KanbanColumnProps) => {
	const [isAdding, setIsAdding] = useState(false)
	const [title, setTitle] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { setNodeRef } = useDroppable({ id: column.id })

	const handleAddSubmit = async () => {
		if (!title.trim()) {
			setIsAdding(false)
			return
		}

		setIsSubmitting(true)

		try {
			await onAddTask(title, column.id as TaskStatus)
			setTitle('')
			setIsAdding(false)
		} catch (error) {
			console.error('Error adding task:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

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
						<KanbanTaskCard key={task.$id} task={task} />
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
						<svg width='10' height='10' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M11 5H7V1C7 0.734784 6.89464 0.48043 6.70711 0.292893C6.51957 0.105357 6.26522 0 6 0C5.73478 0 5.48043 0.105357 5.29289 0.292893C5.10536 0.48043 5 0.734784 5 1V5H1C0.734784 5 0.48043 5.10536 0.292893 5.29289C0.105357 5.48043 0 5.73478 0 6C0 6.26522 0.105357 6.51957 0.292893 6.70711C0.48043 6.89464 0.734784 7 1 7H5V11C5 11.2652 5.10536 11.5196 5.29289 11.7071C5.48043 11.8946 5.73478 12 6 12C6.26522 12 6.51957 11.8946 6.70711 11.7071C6.89464 11.5196 7 11.2652 7 11V7H11C11.2652 7 11.5196 6.89464 11.7071 6.70711C11.8946 6.51957 12 6.26522 12 6C12 5.73478 11.8946 5.48043 11.7071 5.29289C11.5196 5.10536 11.2652 5 11 5Z'
								fill='var(--text)'
							/>
						</svg>
						<span>Create</span>
					</button>
				)}
			</div>
		</div>
	)
}
