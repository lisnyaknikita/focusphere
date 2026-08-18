import { DynamicWidget } from './components/dynamic-widget/dynamic-widget'
import { EventsBlock } from './components/events/events'
import { TasksBlock } from './components/tasks/tasks'
import classes from './dashboard-block.module.scss'

export const DashboardBlock = () => {
	return (
		<main className={classes.dashboardInner}>
			<EventsBlock />
			<DynamicWidget />
			<TasksBlock />
		</main>
	)
}
