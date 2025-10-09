import { ProjectTabs } from './components/tabs/tabs'
import classes from './page.module.scss'

export default function ProjectLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
	return (
		<div className={classes.projectPage}>
			<header className={classes.header}>
				<ProjectTabs projectId={params.id} />
			</header>
			<main className={classes.main}>{children}</main>
		</div>
	)
}
