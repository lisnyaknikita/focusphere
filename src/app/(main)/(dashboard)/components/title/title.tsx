'use client'

import { useToday } from '@/shared/hooks/date/use-today'
import classes from './title.module.scss'

export const Title = () => {
	const today = useToday()

	if (!today) return <h1 className={classes.title}>&nbsp;</h1>

	const { weekday, day, month } = today

	return <h1 className={classes.title}>{`${weekday}, ${month} ${day}`}</h1>
}
