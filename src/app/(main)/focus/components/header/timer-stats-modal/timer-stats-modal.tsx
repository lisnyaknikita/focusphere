'use client'

import { useUserFromContext } from '@/shared/context/user-context'
import { formatMinutesToHours, useTimerStats } from '@/shared/hooks/focus/use-timer-stats'
import { AnimatePresence, motion } from 'framer-motion'
import { BeatLoader } from 'react-spinners'
import classes from './timer-stats-modal.module.scss'

const ChevronLeftIcon = () => (
	<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M15 18l-6-6 6-6'
			stroke='currentColor'
			strokeWidth='2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			fill='none'
		/>
	</svg>
)

const ChevronRightIcon = () => (
	<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M9 18l6-6-6-6'
			stroke='currentColor'
			strokeWidth='2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			fill='none'
		/>
	</svg>
)

export const TimerStatsModal = () => {
	const { user } = useUserFromContext()

	const {
		isCurrentWeek,
		dateRangeLabel,
		isLoading,
		dailyStats,
		formattedTotalTime,
		totalSessions,
		formattedDailyAverage,
		maxDailyMinutes,
		goToPreviousWeek,
		goToNextWeek,
		// goToCurrentWeek,
	} = useTimerStats(user?.$id)

	return (
		<div className={classes.modalInner}>
			<div className={classes.header}>
				<h3 className={classes.title}>Focus Statistics</h3>
				<p className={classes.subtitle}>Track your productive work time over time</p>
			</div>
			<div className={classes.navigation}>
				<div className={classes.navControls}>
					<button className={classes.navBtn} onClick={goToPreviousWeek} title='Previous week'>
						<ChevronLeftIcon />
					</button>
					<span className={classes.dateRange}>{dateRangeLabel}</span>
					<button className={classes.navBtn} onClick={goToNextWeek} disabled={isCurrentWeek} title='Next week'>
						<ChevronRightIcon />
					</button>
				</div>
				{/* {!isCurrentWeek && (
					<button className={classes.currentWeekBtn} onClick={goToCurrentWeek}>
						Current week
					</button>
				)} */}
			</div>
			<div className={classes.summaryGrid}>
				<div className={classes.summaryCard}>
					<span className={classes.cardLabel}>Total time</span>
					<span className={classes.cardValue}>{formattedTotalTime}</span>
				</div>
				<div className={classes.summaryCard}>
					<span className={classes.cardLabel}>Sessions</span>
					<span className={classes.cardValue}>{totalSessions}</span>
				</div>
				<div className={classes.summaryCard}>
					<span className={classes.cardLabel}>Daily avg</span>
					<span className={classes.cardValue}>{formattedDailyAverage}</span>
				</div>
			</div>

			<div className={classes.chartSection}>
				{isLoading ? (
					<div className={classes.loaderWrapper}>
						<BeatLoader color='var(--textSecondary)' size={8} />
					</div>
				) : (
					<div className={classes.chartContainer}>
						<AnimatePresence mode='wait'>
							{dailyStats.map(day => {
								const heightPct = maxDailyMinutes > 0 ? (day.totalMinutes / maxDailyMinutes) * 100 : 0
								const hasData = day.totalMinutes > 0

								return (
									<div key={day.shortDate} className={classes.barCol}>
										<div className={classes.barTrack}>
											<div className={classes.tooltip}>
												<span className={classes.tooltipTitle}>{day.shortDate}</span>
												<span className={classes.tooltipValue}>
													{hasData ? formatMinutesToHours(day.totalMinutes) : 'No sessions'}
												</span>
												{day.sessionCount > 0 && (
													<span className={classes.tooltipValue}>
														{day.sessionCount} session{day.sessionCount !== 1 ? 's' : ''}
													</span>
												)}
											</div>

											<motion.div
												className={`${classes.bar} ${hasData ? classes.active : ''} ${
													day.isToday ? classes.today : ''
												}`}
												initial={{ height: 0 }}
												animate={{ height: hasData ? `${Math.max(heightPct, 4)}%` : '4%' }}
												transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.03 }}
												style={{ opacity: hasData ? 1 : 0.2 }}
											/>
										</div>

										<span className={`${classes.dayLabel} ${day.isToday ? classes.todayLabel : ''}`}>
											{day.dayName}
										</span>
										<span className={classes.dateSublabel}>{day.fullDate.getDate()}</span>
									</div>
								)
							})}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	)
}
