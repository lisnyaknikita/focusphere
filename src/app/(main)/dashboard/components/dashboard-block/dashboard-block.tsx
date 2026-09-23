import { DynamicWidget } from './components/dynamic-widget/dynamic-widget'
import { TasksBlock } from './components/tasks/tasks'
import { WeeklyFocusBlock } from './components/weekly-focus/weekly-focus-block'
import classes from './dashboard-block.module.scss'

export const DashboardBlock = () => {
	return (
		<main className={classes.dashboardInner}>
			<WeeklyFocusBlock />
			<DynamicWidget />
			<TasksBlock />
		</main>
	)
}
