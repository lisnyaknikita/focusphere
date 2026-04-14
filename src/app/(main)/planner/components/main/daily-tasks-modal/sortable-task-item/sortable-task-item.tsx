import { DailyTask } from '@/shared/types/daily-task'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import classes from './sortable-task-item.module.scss'

interface SortableItemProps {
	task: DailyTask
	editingTaskId: string | null
	children: React.ReactNode
}

export const SortableTaskItem = ({ task, editingTaskId, children }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.$id,
		disabled: editingTaskId === task.$id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
		position: 'relative' as const,
		touchAction: 'none',
	}

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={clsx(classes.sortableItem, isDragging && 'isDragging')}
		>
			{children}
		</li>
	)
}
