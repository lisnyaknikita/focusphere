'use client'

import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { Column, Task } from '@/shared/types/kanban'
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import classes from './kanban-board.module.scss'
import { KanbanColumn } from './kanban-column/kanban-column'
import { KanbanTaskCard } from './kanban-column/kanban-task-card/kanban-task-card'

const COLUMNS: Column[] = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'inprogress', title: 'In Progress' },
	// { id: 'review', title: 'Review' },
	{ id: 'done', title: 'Done' },
]

const TASKS: Task[] = [
	{
		id: 'task-1',
		title: 'Setup project',
		description: 'Initialize repository and install dependencies',
		assignee: 'Alice',
		createdAt: 'Feb 20',
		columnId: 'todo',
	},
	{
		id: 'task-2',
		title: 'Design login page',
		description: 'Create UI mockups for login and registration',
		assignee: 'Bob',
		createdAt: 'Feb 19',
		columnId: 'todo',
	},
	{
		id: 'task-3',
		title: 'Implement authentication',
		description: 'Setup Firebase authentication with email & Google',
		assignee: 'Charlie',
		createdAt: 'Feb 18',
		columnId: 'inprogress',
	},
	{
		id: 'task-4',
		title: 'Write unit tests',
		description: 'Cover authentication logic with Jest tests',
		assignee: 'Diana',
		createdAt: 'Feb 20',
		columnId: 'todo',
	},
	{
		id: 'task-5',
		title: 'Deploy to Vercel',
		description: 'Configure CI/CD pipeline and deploy app',
		assignee: 'Eve',
		createdAt: 'Feb 17',
		columnId: 'done',
	},
]

export const KanbanBoard = () => {
	const [tasks, setTasks] = useState<Task[]>(TASKS)
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const { sectionRef, listHeight } = useSectionHeight(0.894)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over) {
			setActiveTask(null)
			return
		}

		const taskId = active.id as string
		const newStatus = over.id as Task['columnId']

		setTasks(() => tasks.map(task => (task.id === taskId ? { ...task, columnId: newStatus } : task)))
		setActiveTask(null)
	}

	return (
		<div className={classes.kanbanWrapper} ref={sectionRef}>
			<DndContext
				onDragEnd={handleDragEnd}
				onDragStart={({ active }) => {
					const current = tasks.find(t => t.id === active.id)
					setActiveTask(current ?? null)
				}}
			>
				{COLUMNS.map(column => (
					<KanbanColumn
						key={column.id}
						column={column}
						tasks={tasks.filter(task => task.columnId === column.id)}
						listHeight={listHeight}
					/>
				))}
				<DragOverlay>{activeTask ? <KanbanTaskCard task={activeTask} /> : null}</DragOverlay>
			</DndContext>
		</div>
	)
}
