'use client'

import { DailyTask } from '@/shared/types/daily-task'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import classes from './sortable-task-item.module.scss'

interface SortableItemProps {
	task: DailyTask
	editingTaskId: string | null
	children: React.ReactNode
}

export const SortableTaskItem = ({ task, editingTaskId, children }: SortableItemProps) => {
	const isEditing = editingTaskId === task.$id

	const wasDraggingRef = useRef(false)

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.$id,
		disabled: isEditing,
	})

	useEffect(() => {
		if (isDragging) {
			wasDraggingRef.current = true
		} else {
			const timer = setTimeout(() => {
				wasDraggingRef.current = false
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [isDragging])

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
		position: 'relative' as const,
		touchAction: isDragging ? 'none' : isEditing ? 'auto' : 'pan-y',
	}

	const dragProps = isEditing ? {} : { ...attributes, ...listeners }

	const handleClick = (e: React.MouseEvent) => {
		if (wasDraggingRef.current) {
			e.preventDefault()
			e.stopPropagation()
			wasDraggingRef.current = false
			return
		}
	}

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...dragProps}
			onClick={handleClick}
			className={clsx(classes.sortableItem, isDragging && classes.isDragging, isEditing && classes.isEditing)}
		>
			{children}
		</li>
	)
}
