import { EventModalWrapper } from '@/shared/ui/event-modal-wrapper/event-modal-wrapper'
import { DashboardBlock } from './components/dashboard-block/dashboard-block'
import { QuickAccess } from './components/quick-access/quick-access'
import { Title } from './components/title/title'

import { DailyTasksModalWrapper } from '@/shared/ui/daily-tasks-modal-wrapper/daily-tasks-modal-warpper'
import { QuickIdeasWidget } from './components/quick-ideas-widget/quick-ideas-widget'
import classes from './page.module.scss'

export default function Dashboard() {
	return (
		<div className={classes.dashboard}>
			<header className={classes.header}>
				<Title />
				<QuickIdeasWidget />
			</header>
			<DashboardBlock />
			<QuickAccess />
			<EventModalWrapper />
			<DailyTasksModalWrapper />
		</div>
	)
}
