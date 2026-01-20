import { ProjectProvider } from '@/shared/context/project-context'
import { ProjectHeader } from './components/project-header/project-header'
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
				<ProjectHeader projectId={id} />
				<main className={classes.main}>{children}</main>
			</div>
		</ProjectProvider>
	)
}
