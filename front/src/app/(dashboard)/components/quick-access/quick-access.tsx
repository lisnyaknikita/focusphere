import classes from './quick-access.module.scss'

export const QuickAccess = () => {
	return (
		<footer>
			<div className={classes.buttons}>
				<a href='#' className={classes.button}>
					Start Pomodoro
				</a>
				<a href='#' className={classes.button}>
					Go to the project
				</a>
				<a href='#' className={classes.button}>
					Create notes
				</a>
			</div>
		</footer>
	)
}
