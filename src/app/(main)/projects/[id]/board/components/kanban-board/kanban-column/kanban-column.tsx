'use client'

import { useCreateTask } from '@/shared/hooks/projects/kanban-board/use-create-task'
import { Column } from '@/shared/types/kanban'
import { CreateKanbanTaskPayload, KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import classes from './kanban-column.module.scss'
import { KanbanTaskCard } from './kanban-task-card/kanban-task-card'

interface KanbanColumnProps {
	column: Column
	tasks: KanbanTask[]
	listHeight: number
	isOverlay?: boolean
	autoFocusTitle?: boolean
	onDeleteColumn?: () => void
	onUpdateTitle?: (columnId: string, newTitle: string) => void
	onAddTask: (title: string, status: TaskStatus) => Promise<void>
	onUpdateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	onDeleteTask: (taskId: string) => Promise<void>
}

export const KanbanColumn = ({
	column,
	tasks,
	listHeight,
	isOverlay,
	autoFocusTitle,
	onUpdateTitle,
	onDeleteColumn,
	onAddTask,
	onUpdateTask,
	onDeleteTask,
}: KanbanColumnProps) => {
	const [isEditingTitle, setIsEditingTitle] = useState(autoFocusTitle ?? false)
	const [editTitle, setEditTitle] = useState(column.title)

	const isSystemColumn = ['todo', 'inprogress', 'done'].includes(column.id)

	const { isAdding, title, setTitle, handleAddSubmit, setIsAdding, isSubmitting } = useCreateTask({ onAddTask, column })

	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: {
			type: 'Column',
		},
	})

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging && !isOverlay ? 0.4 : 1,
	}

	useEffect(() => {
		if (autoFocusTitle) setIsEditingTitle(true)
	}, [autoFocusTitle])

	useEffect(() => {
		setEditTitle(column.title)
	}, [column.title])

	const handleTitleSubmit = () => {
		if (!editTitle.trim()) {
			setEditTitle(column.title)
			setIsEditingTitle(false)
			return
		}
		onUpdateTitle?.(column.id, editTitle.trim())
		setIsEditingTitle(false)
	}

	const taskIds = tasks.map(task => task.$id)

	return (
		<div className={`${classes.column} ${isOverlay ? classes.columnOverlay : ''}`} ref={setNodeRef} style={style}>
			<header className={classes.columnHeader} {...attributes} {...listeners}>
				<span className={classes.icon} />
				{isEditingTitle ? (
					<input
						className={classes.columnTitleInput}
						value={editTitle}
						onChange={e => setEditTitle(e.target.value)}
						onBlur={handleTitleSubmit}
						autoFocus
						maxLength={25}
						onKeyDown={e => {
							e.stopPropagation()
							if (e.key === 'Enter') handleTitleSubmit()
							if (e.key === 'Escape') {
								setEditTitle(column.title)
								setIsEditingTitle(false)
							}
						}}
						onMouseDown={e => e.stopPropagation()}
						onClick={e => e.stopPropagation()}
					/>
				) : (
					<h3 className={classes.columnTitle} onClick={() => setIsEditingTitle(true)}>
						{column.title}
					</h3>
				)}
				<div className={classes.headerActions}>
					{!isSystemColumn && !isOverlay && onDeleteColumn && (
						<button
							type='button'
							className={classes.deleteColumnBtn}
							onClick={e => {
								e.stopPropagation()
								onDeleteColumn()
							}}
							title='Delete column'
						>
							<DeleteIcon />
						</button>
					)}
					<div className={classes.tasksCounter}>{tasks.length}</div>
				</div>
			</header>
			<div className={classes.scrollWrapper} style={{ maxHeight: `${listHeight}px` }}>
				<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
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
				</SortableContext>

				{!isAdding && !isOverlay && (
					<button className={classes.createButton} onClick={() => setIsAdding(true)}>
						<PlusIcon />
						<span>Create</span>
					</button>
				)}
			</div>
		</div>
	)
}
