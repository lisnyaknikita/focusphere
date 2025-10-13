'use client'

import { Column, Task } from '@/shared/types/kanban'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'
import classes from './kanban-board.module.scss'
import { KanbanColumn } from './kanban-column/kanban-column'

const COLUMNS: Column[] = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'inprogress', title: 'In Progress' },
	{ id: 'review', title: 'Review' },
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
		columnId: 'review',
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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over) return

		const taskId = active.id as string
		const newStatus = over.id as Task['columnId']

		setTasks(() => tasks.map(task => (task.id === taskId ? { ...task, columnId: newStatus } : task)))
	}

	return (
		<div className={classes.kanbanWrapper}>
			<DndContext onDragEnd={handleDragEnd}>
				{COLUMNS.map(column => (
					<KanbanColumn key={column.id} column={column} tasks={tasks.filter(task => task.columnId === column.id)} />
				))}
			</DndContext>
		</div>
	)
}
