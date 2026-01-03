import { useToday } from '@/shared/hooks/date/use-today'
import classes from './title.module.scss'

export const Title = () => {
	const { weekday, day } = useToday()
	return <h1 className={classes.title}>{`${weekday}, ${day}`}</h1>
}
