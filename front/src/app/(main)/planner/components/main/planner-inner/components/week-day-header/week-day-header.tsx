import clsx from 'clsx'
import classes from './week-day-header.module.scss'

interface WeekDayHeaderProps {
	date: string
	incompleteTasksCount: number
	onDayClick: (date: string) => void
}

export const WeekDayHeader = ({ date, onDayClick, incompleteTasksCount }: WeekDayHeaderProps) => {
	const plainDate = Temporal.PlainDate.from(date)

	const weekday = plainDate.toLocaleString('en-US', { weekday: 'short' })
	const day = plainDate.day

	const today = Temporal.Now.plainDateISO()

	const isToday = plainDate.equals(today)

	return (
		<div className={clsx(classes.weekday, isToday && 'today')} onClick={() => onDayClick(date)}>
			<span className={classes.counter}>{incompleteTasksCount}</span>
			<span className={classes.weekdayText}>{weekday}</span>
			<span className={classes.day}>{day}</span>
		</div>
	)
}
