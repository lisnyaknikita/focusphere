'use client'

import { useUserFromContext } from '@/shared/context/user-context'
import { formatMinutesToHours, useTimerStats } from '@/shared/hooks/focus/use-timer-stats'
import { ChevronLeftIcon } from '@/shared/ui/icons/focus/chevron-left-icon'
import { ChevronRightIcon } from '@/shared/ui/icons/focus/chevron-right-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { BeatLoader } from 'react-spinners'
import classes from './pomodoro-stats.module.scss'

export const PomodoroStats = () => {
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
	} = useTimerStats(user?.$id)

	if (isLoading && dailyStats.length === 0) {
		return (
			<div className={classes.loaderWrapper}>
				<BeatLoader color='var(--textSecondary)' size={8} />
			</div>
		)
	}

	return (
		<div className={classes.pomodoroStats}>
			<header className={classes.statsHeader}>
				<div className={classes.topRow}>
					<div className={classes.totalGroup}>
						<span className={classes.totalTime}>{formattedTotalTime}</span>
						<span className={classes.subLabel}>Total focus this week</span>
					</div>
				</div>

				<div className={classes.metaRow}>
					<div className={classes.badgesGroup}>
						<span className={classes.badge}>
							{totalSessions} session{totalSessions !== 1 ? 's' : ''}
						</span>
						<span className={classes.badge}>~{formattedDailyAverage}/day</span>
					</div>

					<div className={classes.navGroup}>
						<button type='button' className={classes.navBtn} onClick={goToPreviousWeek} title='Previous week'>
							<ChevronLeftIcon />
						</button>
						<span className={classes.dateRange}>{dateRangeLabel}</span>
						<button
							type='button'
							className={classes.navBtn}
							onClick={goToNextWeek}
							disabled={isCurrentWeek}
							title='Next week'
						>
							<ChevronRightIcon />
						</button>
					</div>
				</div>
			</header>

			<div className={classes.chartContainer}>
				{isLoading ? (
					<div className={classes.loaderWrapper}>
						<BeatLoader color='var(--textSecondary)' size={8} />
					</div>
				) : (
					<AnimatePresence mode='wait'>
						{dailyStats.map(day => {
							const heightPct = maxDailyMinutes > 0 ? (day.totalMinutes / maxDailyMinutes) * 100 : 0
							const hasData = day.totalMinutes > 0
							const barHeight = hasData ? Math.max(heightPct, 4) : 4

							return (
								<div key={day.shortDate} className={classes.barCol}>
									<div className={classes.barTrack}>
										<div className={classes.tooltip} style={{ bottom: `calc(${barHeight}% + 6px)` }}>
											<span className={classes.tooltipTitle}>{day.shortDate}</span>
											<span className={classes.tooltipValue}>
												{hasData ? formatMinutesToHours(day.totalMinutes) : 'No sessions'}
											</span>
											{day.sessionCount > 0 && (
												<span className={classes.tooltipSub}>
													{day.sessionCount} session{day.sessionCount !== 1 ? 's' : ''}
												</span>
											)}
										</div>

										<motion.div
											className={`${classes.bar} ${hasData ? classes.active : ''} ${day.isToday ? classes.today : ''}`}
											initial={{ height: 0 }}
											animate={{ height: `${barHeight}%` }}
											transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.02 }}
											style={{ opacity: hasData ? 1 : 0.25 }}
										/>
									</div>

									<span className={`${classes.dayLabel} ${day.isToday ? classes.todayLabel : ''}`}>{day.dayName}</span>
									<span className={classes.dateSublabel}>{day.fullDate.getDate()}</span>
								</div>
							)
						})}
					</AnimatePresence>
				)}
			</div>
		</div>
	)
}
