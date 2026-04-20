import clsx from 'clsx'
import { useMemo } from 'react'
import classes from './week-day-header.module.scss'

interface WeekDayHeaderProps {
	date: string
	incompleteTasksCount?: number
	onDayClick?: (date: string) => void
}

export const WeekDayHeader = ({ date, onDayClick, incompleteTasksCount = 0 }: WeekDayHeaderProps) => {
	const { weekday, day, isToday } = useMemo(() => {
		const plainDate = Temporal.PlainDate.from(date)
		const today = Temporal.Now.plainDateISO()

		return {
			weekday: plainDate.toLocaleString('en-US', { weekday: 'short' }),
			day: plainDate.day,
			isToday: plainDate.equals(today),
		}
	}, [date])

	const isClickable = !!onDayClick

	return (
		<button
			type='button'
			className={clsx(classes.weekday, isToday && 'today', !isClickable && 'static')}
			onClick={() => onDayClick?.(date)}
		>
			<div className={classes.labelWrapper}>
				<span className={classes.weekdayText}>{weekday}</span>
				{incompleteTasksCount > 0 && <span className={classes.counter}>{incompleteTasksCount}</span>}
			</div>
			<span className={classes.day}>{day}</span>
		</button>
	)
}
