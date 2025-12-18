import classes from './week-day-header.module.scss'

interface WeekDayHeaderProps {
	date: string
	onDailyTasksModalVisible: (status: boolean) => void
}

export const WeekDayHeader = ({ date, onDailyTasksModalVisible }: WeekDayHeaderProps) => {
	const plainDate = Temporal.PlainDate.from(date)

	const weekday = plainDate.toLocaleString('en-US', { weekday: 'short' })
	const day = plainDate.day

	return (
		<div className={classes.weekday} onClick={() => onDailyTasksModalVisible(true)}>
			<span>{weekday}</span>
			<span>{day}</span>
		</div>
	)
}
