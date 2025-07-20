import { DashboardBlock } from './components/dashboard-block/dashboard-block'
import { QuickAccess } from './components/quick-access/quick-access'
import { Title } from './components/title/title'

import classes from './page.module.scss'

export default function Dashboard() {
	return (
		<div className={classes.dashboard}>
			<Title />
			<DashboardBlock />
			<QuickAccess />
		</div>
	)
}
