import { useToday } from '@/shared/hooks/date/use-today'
import classes from './title.module.scss'

export const Title = () => {
	const { weekday, day, month } = useToday()

	return <h1 className={classes.title}>{`${weekday}, ${month} ${day}`}</h1>
}
