import classes from './not-found.module.scss'

export const NotFoundPage = () => {
	return (
		<div className={classes.inner}>
			<h2 className={classes.title}>404</h2>
			<h6 className={classes.subtitle}>It seems you got a little bit lost</h6>
		</div>
	)
}
