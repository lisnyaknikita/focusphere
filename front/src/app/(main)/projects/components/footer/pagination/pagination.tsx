import clsx from 'clsx'
import classes from './pagination.module.scss'

export const Pagination = () => {
	return (
		<div className={classes.paginationButtons}>
			<button className={clsx(classes.button, 'active')}>1</button>
			<button className={classes.button}>2</button>
			<button className={classes.button}>3</button>
		</div>
	)
}
