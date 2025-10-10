import classes from './tags.module.scss'

export const Tags = () => {
	return (
		<div className={classes.tagsWrapper}>
			<h3 className={classes.title}>Tags</h3>
			<ul className={classes.tagsList}>
				<li className={classes.tag}>#ideas</li>
				<li className={classes.tag}>#design</li>
			</ul>
		</div>
	)
}
