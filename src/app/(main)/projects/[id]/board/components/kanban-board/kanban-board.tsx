'use client'

import { useProject } from '@/shared/context/project-context'
import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { Column } from '@/shared/types/kanban'
import { KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './kanban-board.module.scss'
import { KanbanColumn } from './kanban-column/kanban-column'
import { KanbanTaskCard } from './kanban-column/kanban-task-card/kanban-task-card'

const COLUMNS: Column[] = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'inprogress', title: 'In Progress' },
	// { id: 'review', title: 'Review' },
	{ id: 'done', title: 'Done' },
]

export const KanbanBoard = () => {
	const { project } = useProject()
	const { tasks, isLoading, addTask, moveTask, updateTask, deleteTask } = useKanban(project!)
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
	const { sectionRef, listHeight } = useSectionHeight(0.894)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over) {
			setActiveTask(null)
			return
		}

		const taskId = active.id as string
		const newStatus = over.id as TaskStatus

		moveTask(taskId, newStatus)
		setActiveTask(null)
	}

	if (isLoading) return <BeatLoader color='#aaa' size={10} className={classes.loader} />

	return (
		<div className={classes.kanbanWrapper} ref={sectionRef}>
			<DndContext
				onDragEnd={handleDragEnd}
				onDragStart={({ active }) => {
					const current = tasks.find(t => t.$id === active.id)
					setActiveTask(current ?? null)
				}}
			>
				{COLUMNS.map(column => (
					<KanbanColumn
						key={column.id}
						column={column}
						tasks={tasks.filter(task => task.status === column.id)}
						listHeight={listHeight}
						onAddTask={addTask}
						onUpdateTask={updateTask}
						onDeleteTask={deleteTask}
					/>
				))}
				<DragOverlay>
					{activeTask ? <KanbanTaskCard task={activeTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
