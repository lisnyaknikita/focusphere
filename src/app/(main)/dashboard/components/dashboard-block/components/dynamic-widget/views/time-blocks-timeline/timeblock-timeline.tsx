'use client'

import { useEventsByToday } from '@/shared/hooks/events/use-events-by-today'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { formatTimeRange, getBlockStatus } from '@/shared/utils/timeblock-timeline-helpers/timeblock-timeline-helpers'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './timeblock-timeline.module.scss'

const COLOR_MAP: Record<string, string> = {
	blue: '#3b82f6',
	green: '#22c55e',
	red: '#ef4444',
	yellow: '#eab308',
	purple: '#a855f7',
	orange: '#f97316',
	pink: '#ec4899',
	indigo: '#6366f1',
	teal: '#14b8a6',
}

export const TimeBlocksTimeline = () => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const router = useRouter()
	const { events, isLoading } = useEventsByToday()
	const currentBlockRef = useRef<HTMLDivElement>(null)

	const todayBlocks = useMemo(() => {
		return [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
	}, [events])

	useEffect(() => {
		if (currentBlockRef.current) {
			currentBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		}
	}, [todayBlocks])

	if (isLoading) {
		return (
			<div className={classes.loaderWrapper}>
				<BeatLoader color='var(--textSecondary)' size={8} />
			</div>
		)
	}

	if (todayBlocks.length === 0) {
		return (
			<div className={classes.emptyState}>
				<p className={classes.emptyTitle}>No events scheduled for today</p>
				<button type='button' className={classes.plannerBtn} onClick={() => router.push('/calendar')}>
					Open Calendar
				</button>
			</div>
		)
	}

	return (
		<div className={classes.timelineWrapper}>
			<div className={classes.timelineHeader}>
				<span className={classes.title}>Today&apos;s Schedule</span>
				<span className={classes.countBadge}>{todayBlocks.length} events</span>
			</div>

			<div className={classes.timelineStream}>
				{todayBlocks.map(block => {
					const status = getBlockStatus(block.startDate, block.endDate)
					const isCurrent = status === 'current'
					const colorHex = COLOR_MAP[block.color] || block.color || '#3b82f6'

					return (
						<motion.div
							key={block.$id}
							ref={isCurrent ? currentBlockRef : null}
							className={clsx(classes.blockCard, classes[status])}
							style={{ borderLeftColor: colorHex }}
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2 }}
						>
							<div className={classes.cardHeader}>
								<div className={classes.timeInfo}>
									<span className={classes.dot} style={{ backgroundColor: colorHex }} />
									<span className={classes.timeRange}>
										{formatTimeRange(block.startDate, block.endDate, timeFormat)}
									</span>
								</div>
								{isCurrent && <span className={classes.nowBadge}>NOW</span>}
							</div>
							<h4 className={classes.blockTitle}>{block.title}</h4>
						</motion.div>
					)
				})}
				<div className={classes.scheduleEndSection}>
					<div className={classes.endDivider}>
						<span>End of schedule · Free time</span>
					</div>
					<button type='button' className={classes.actionPlannerCard} onClick={() => router.push('/calendar')}>
						<span>Open Calendar to manage events</span>
						<span className={classes.arrowIcon}>→</span>
					</button>
				</div>
			</div>
		</div>
	)
}
