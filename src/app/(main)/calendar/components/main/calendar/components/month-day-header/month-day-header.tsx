'use client'

import { useDailyTasksCountForDate } from '@/app/(main)/planner/daily-tasks-count-context'
import { useCalendarCopyMode } from '@/features/calendar/calendar-copy-mode-context'
import clsx from 'clsx'
import { useMemo } from 'react'
import classes from './month-day-header.module.scss'

interface MonthDayHeaderProps {
	date: number
	jsDate: Date
	onDayClick?: (date: string) => void
}

export const MonthDayHeader = ({ date, jsDate, onDayClick }: MonthDayHeaderProps) => {
	const isCopyMode = useCalendarCopyMode()

	const { dateIso, isToday } = useMemo(() => {
		const year = jsDate.getFullYear()
		const month = String(jsDate.getMonth() + 1).padStart(2, '0')
		const dayStr = String(jsDate.getDate()).padStart(2, '0')
		const iso = `${year}-${month}-${dayStr}`
		const todayIso = new Date().toISOString().slice(0, 10)
		return {
			dateIso: iso,
			isToday: iso === todayIso,
		}
	}, [jsDate])

	const incompleteCount = useDailyTasksCountForDate(dateIso)

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDayClick?.(dateIso)
	}

	return (
		<button
			type='button'
			className={clsx(classes.monthDayHeader, isToday && 'today', isCopyMode && classes.copyMode)}
			onClick={handleClick}
			aria-label={`Date ${date}${incompleteCount > 0 ? `, ${incompleteCount} tasks` : ''}`}
		>
			<span className={classes.dateNumber}>{date}</span>
			{incompleteCount > 0 && <span className={classes.counter}>{incompleteCount}</span>}
		</button>
	)
}
