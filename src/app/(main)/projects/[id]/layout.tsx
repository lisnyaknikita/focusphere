import { ProjectProvider } from '@/shared/context/project-context'
import { ProjectTabs } from './components/tabs/tabs'
import classes from './page.module.scss'

export default async function ProjectLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<ProjectProvider projectId={id}>
			<div className={classes.projectPage}>
				<header className={classes.header}>
					<ProjectTabs projectId={id} />
				</header>
				<main className={classes.main}>{children}</main>
			</div>
		</ProjectProvider>
	)
}
