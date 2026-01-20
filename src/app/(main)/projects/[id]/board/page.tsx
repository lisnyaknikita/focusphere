'use client'

import { useProject } from '@/shared/context/project-context'
import { BeatLoader } from 'react-spinners'
import { KanbanBoard } from './components/kanban-board/kanban-board'
import { ProjectInfo } from './components/project-header/project-info'
import classes from './page.module.scss'

export default function BoardPage() {
	const { project, isLoading } = useProject()

	return (
		<div className={classes.boardPage}>
			{isLoading ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					{project && <ProjectInfo project={project} />}
					<KanbanBoard />
				</>
			)}
		</div>
	)
}
