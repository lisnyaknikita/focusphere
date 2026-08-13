import { DashboardBlock } from './components/dashboard-block/dashboard-block'
import { QuickAccess } from './components/quick-access/quick-access'
import { Title } from './components/title/title'

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
		</div>
	)
}
