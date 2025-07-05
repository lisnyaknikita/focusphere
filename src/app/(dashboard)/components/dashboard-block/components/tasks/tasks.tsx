import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import classes from './tasks.module.scss'

export const TasksBlock = () => {
	return (
		<section className={classes.tasks}>
			<h2>Tasks for today:</h2>
			<ul>
				<li>
					<CheckboxCard />
				</li>
			</ul>
		</section>
	)
}
