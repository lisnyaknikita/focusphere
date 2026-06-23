'use client'

import { KanbanTask } from '@/shared/types/kanban-task'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import classes from './task-dropdown.module.scss'

const priorityColors: Record<string, string> = {
	low: '#A3A3A3',
	medium: '#FBBF24',
	high: '#F97316',
	urgent: '#DC2626',
}

interface TaskDropdownProps {
	floatingRef: (node: HTMLElement | null) => void
	floatingStyles: React.CSSProperties
	filteredTasks: KanbanTask[]
	dropdownIndex: number
	onSelectTask: (task: KanbanTask) => void
}

export const TaskDropdown = ({
	floatingRef,
	floatingStyles,
	filteredTasks,
	dropdownIndex,
	onSelectTask,
}: TaskDropdownProps) => {
	const containerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const activeItem = containerRef.current.querySelector(`.${classes.active}`) as HTMLElement

		if (activeItem) {
			activeItem.scrollIntoView({
				block: 'nearest',
				behavior: 'auto',
			})
		}
	}, [dropdownIndex])

	const handleCombinedRefs = (node: HTMLDivElement | null) => {
		containerRef.current = node
		floatingRef(node)
	}

	return (
		<div ref={handleCombinedRefs} className={classes.taskDropdown} style={floatingStyles}>
			{filteredTasks.length > 0 ? (
				filteredTasks.map((task, idx) => (
					<div
						key={task.$id}
						className={clsx(classes.dropdownItem, idx === dropdownIndex && classes.active)}
						onMouseDown={e => {
							e.preventDefault()
							onSelectTask(task)
						}}
					>
						<span className={classes.dropdownTaskCode}>{task.taskCode}</span>
						<span className={classes.dropdownTaskTitle}>{task.title}</span>
						<span
							className={classes.dropdownPriorityDot}
							style={{
								backgroundColor: priorityColors[task.priority || 'medium'],
							}}
						/>
					</div>
				))
			) : (
				<div className={classes.noTasksMsg}>No matching tasks found</div>
			)}
		</div>
	)
}
