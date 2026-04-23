import { ProjectProvider } from '@/shared/context/project-context'
import { Metadata } from 'next'
import { ProjectHeader } from './components/project-header/project-header'
import classes from './page.module.scss'

export const metadata: Metadata = {
	title: 'Project Workspace - Focusphere',
	description: 'Project management, team chat, and note',
}

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
