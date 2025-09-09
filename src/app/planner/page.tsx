import { WeekView } from '../calendar/components/main/calendar/views/week/week'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import classes from './page.module.scss'

export default function Planner() {
	return (
		<>
			<div className={classes.plannerPage}>
				<header className={classes.header}>
					<WeeklyGoals />
					<AddTimeBlockButton />
				</header>
				<main className={classes.planner}>
					<WeekView />
				</main>
			</div>
			{/* modal */}
		</>
	)
}
