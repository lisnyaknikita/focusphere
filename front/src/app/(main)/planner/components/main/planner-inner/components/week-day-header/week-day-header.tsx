import classes from './week-day-header.module.scss'

interface WeekDayHeaderProps {
	date: string
	onDayClick: (date: string) => void
}

export const WeekDayHeader = ({ date, onDayClick }: WeekDayHeaderProps) => {
	const plainDate = Temporal.PlainDate.from(date)

	const weekday = plainDate.toLocaleString('en-US', { weekday: 'short' })
	const day = plainDate.day

	return (
		<div className={classes.weekday} onClick={() => onDayClick(date)}>
			<span>{weekday}</span>
			<span>{day}</span>
		</div>
	)
}
