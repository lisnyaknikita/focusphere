'use client'

import { OwnerAvatar } from '@/app/(main)/projects/components/main/projects-list/project-card/components/owner-avatar/owner-avatar'
import { priorityColors, priorityLabels, statusColors, statusLabels } from '@/shared/context/task-highlight.constants'
import { KanbanTask } from '@/shared/types/kanban-task'
import {
	autoUpdate,
	flip,
	FloatingPortal,
	offset,
	safePolygon,
	shift,
	useFloating,
	useHover,
	useInteractions,
} from '@floating-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './task-highlight.module.scss'

interface TaskHighlightProps {
	task: KanbanTask
}

export const TaskHighlight = ({ task }: TaskHighlightProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'top-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const hover = useHover(context, {
		delay: { open: 150, close: 150 },
		handleClose: safePolygon(),
	})

	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const status = task.status || 'todo'
	const priority = task.priority || 'medium'
	const statusConf = statusColors[status] || statusColors.todo
	const priorityColor = priorityColors[priority] || priorityColors.medium

	return (
		<>
			<span ref={refs.setReference} className={classes.taskLink} {...getReferenceProps()}>
				#{task.taskCode}
			</span>

			<AnimatePresence>
				{isOpen && (
					<FloatingPortal>
						<div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 1000 }} {...getFloatingProps()}>
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 5 }}
								transition={{ duration: 0.15 }}
								className={classes.taskTooltip}
							>
								<div className={classes.tooltipHeader}>
									<span className={classes.taskCode}>{task.taskCode}</span>
									<span
										className={classes.statusBadge}
										style={{
											backgroundColor: statusConf.bg,
											color: statusConf.text,
											borderColor: statusConf.border,
										}}
									>
										{statusLabels[status] || status}
									</span>
								</div>

								<h4 className={classes.tooltipTitle}>{task.title}</h4>

								{task.description && (
									<p className={classes.tooltipDescription} title={task.description}>
										{task.description.length > 120 ? `${task.description.substring(0, 120)}...` : task.description}
									</p>
								)}

								<div className={classes.tooltipFooter}>
									<div className={classes.assignee}>
										<OwnerAvatar userId={task.assigneeId || ''} size={18} />
										<span>{task.assigneeName || 'Unassigned'}</span>
									</div>

									<div className={classes.priorityBadge}>
										<span className={classes.priorityDot} style={{ backgroundColor: priorityColor }} />
										<span>{priorityLabels[priority] || priority}</span>
									</div>
								</div>
							</motion.div>
						</div>
					</FloatingPortal>
				)}
			</AnimatePresence>
		</>
	)
}
