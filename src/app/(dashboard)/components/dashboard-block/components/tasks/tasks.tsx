import classes from './tasks.module.scss'

export const TasksBlock = () => {
	return (
		<section className={classes.tasks}>
			<h2>Tasks for today:</h2>
			<ul>
				<li>
					<input type='checkbox' defaultChecked />
				</li>
			</ul>
		</section>
	)
}
