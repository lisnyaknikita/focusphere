import { EventsBlock } from './components/events/events'
import { QuotesBlock } from './components/quotes/quotes'
import { TasksBlock } from './components/tasks/tasks'
import classes from './dashboard-block.module.scss'

export const DashboardBlock = () => {
	return (
		<main className={classes.dashboardInner}>
			<EventsBlock />
			<QuotesBlock />
			<TasksBlock />
		</main>
	)
}
