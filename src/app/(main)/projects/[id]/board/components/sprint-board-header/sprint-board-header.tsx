'use client'

import { KanbanTask } from '@/shared/types/kanban-task'
import { Sprint } from '@/shared/types/sprint'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { backlogFormatDateRange } from '@/shared/utils/backlog-format-date-range/backlog-format-date-range'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './sprint-board-header.module.scss'

interface SprintBoardHeaderProps {
	projectId: string
	activeSprint: Sprint
	tasks: KanbanTask[]
	onCompleteSprintClick: (sprint: Sprint) => void
	onEditSprintClick?: (sprint: Sprint) => void
}

export const SprintBoardHeader = ({
	activeSprint,
	tasks,
	onCompleteSprintClick,
	onEditSprintClick,
}: SprintBoardHeaderProps) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const sprintTasks = tasks.filter(t => t.sprintId === activeSprint.$id)
	const completedCount = sprintTasks.filter(t => t.status === 'done').length
	const progressPct = sprintTasks.length > 0 ? Math.round((completedCount / sprintTasks.length) * 100) : 0

	return (
		<div className={classes.headerContainer}>
			<div className={classes.compactBar}>
				<div className={classes.left}>
					<span className={classes.sprintName}>🚀 {activeSprint.name}</span>
					{onEditSprintClick && (
						<button
							type='button'
							className={classes.editBtn}
							onClick={() => onEditSprintClick(activeSprint)}
							title='Edit sprint details'
						>
							<EditIcon width={18} height={18} />
						</button>
					)}
					<span className={`${classes.badge} ${classes[activeSprint.status]}`}>{activeSprint.status}</span>
				</div>

				<div className={classes.right}>
					<span className={classes.progressPill}>
						{completedCount}/{sprintTasks.length} Done ({progressPct}%)
					</span>
					<button
						type='button'
						className={classes.toggleDetailsBtn}
						onClick={() => setIsExpanded(prev => !prev)}
						title='Toggle sprint details'
					>
						<span>{isExpanded ? 'Hide' : 'Details'}</span>
						<ArrowBottomIcon className={clsx(classes.arrowIcon, isExpanded && classes.rotated)} />
					</button>
					{activeSprint.status === 'active' && (
						<button type='button' className={classes.completeBtn} onClick={() => onCompleteSprintClick(activeSprint)}>
							Complete Sprint
						</button>
					)}
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						className={classes.expandedBody}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
					>
						<div className={classes.expandedInner}>
							<div className={classes.detailsGrid}>
								<div className={classes.detailItem}>
									<span className={classes.detailLabel}>Dates:</span>
									<span className={classes.detailValue}>
										{backlogFormatDateRange(activeSprint.startDate, activeSprint.endDate)}
									</span>
								</div>

								<div className={classes.detailItem}>
									<span className={classes.detailLabel}>Progress:</span>
									<div className={classes.progressWrapper}>
										<div className={classes.progressBarTrack}>
											<div className={classes.progressBarFill} style={{ width: `${progressPct}%` }} />
										</div>
										<span className={classes.progressValue}>{progressPct}%</span>
									</div>
								</div>
							</div>

							{activeSprint.goal && (
								<div className={classes.goalContainer}>
									<span className={classes.goalLabel}>Goal:</span>
									<p className={classes.goalText}>&quot;{activeSprint.goal}&quot;</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
