import clsx from 'clsx'
import { useMemo } from 'react'
import classes from './week-day-header.module.scss'

interface WeekDayHeaderProps {
	date: string
	incompleteTasksCount: number
	onDayClick: (date: string) => void
}

export const WeekDayHeader = ({ date, onDayClick, incompleteTasksCount }: WeekDayHeaderProps) => {
	const { weekday, day, isToday } = useMemo(() => {
		const plainDate = Temporal.PlainDate.from(date)
		const today = Temporal.Now.plainDateISO()

		return {
			weekday: plainDate.toLocaleString('en-US', { weekday: 'short' }),
			day: plainDate.day,
			isToday: plainDate.equals(today),
		}
	}, [date])

	return (
		<button type='button' className={clsx(classes.weekday, isToday && 'today')} onClick={() => onDayClick(date)}>
			<span className={classes.counter}>{incompleteTasksCount > 0 && incompleteTasksCount}</span>
			<span className={classes.weekdayText}>{weekday}</span>
			<span className={classes.day}>{day}</span>
		</button>
	)
}
