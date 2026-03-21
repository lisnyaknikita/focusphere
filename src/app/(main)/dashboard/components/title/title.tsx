'use client'

import { useToday } from '@/shared/hooks/date/use-today'
import classes from './title.module.scss'

export const Title = () => {
	const today = useToday()

	if (!today) return <h1 className={classes.title}>&nbsp;</h1>

	const { shortWeekday, day, shortMonth } = today

	return (
		<h1 className={classes.title}>
			<span className={classes.todayWord}>Today</span>
			<span className={classes.separator}>·</span>
			<span className={classes.dateDetail}>{`${shortWeekday} ${day} ${shortMonth}`}</span>
		</h1>
	)
}
