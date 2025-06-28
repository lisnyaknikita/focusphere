import { EventsBlock } from './components/events/events'
import { TasksBlock } from './components/tasks/tasks'
import classes from './dashboard-block.module.scss'

export const DashboardBlock = () => {
	return (
		<main className={classes.dashboardInner}>
			<EventsBlock />
			<section className={classes.clock}>
				<div className={classes.circle}>
					<span id='time'>15:45:20</span>
				</div>
			</section>
			<TasksBlock />
		</main>
	)
}
