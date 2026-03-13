'use client'

import { useProject } from '@/shared/context/project-context'
import { useAcceptInvite } from '@/shared/hooks/projects/invitation/use-accept-invite'
import { BeatLoader } from 'react-spinners'
import { KanbanBoard } from './components/kanban-board/kanban-board'
import { ProjectInfo } from './components/project-header/project-info'
import classes from './page.module.scss'

export default function BoardPage() {
	const { project, isLoading } = useProject()
	const { isAccepting } = useAcceptInvite()

	const showLoader = isAccepting || isLoading

	return (
		<div className={classes.boardPage}>
			{showLoader ? (
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
