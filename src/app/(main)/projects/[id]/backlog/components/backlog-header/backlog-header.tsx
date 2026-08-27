import { useProjectPermissions } from '@/shared/hooks/projects/use-project-permissions'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { Dispatch, SetStateAction } from 'react'
import classes from './backlog-header.module.scss'

interface BacklogHeaderProps {
	sprints: number
	tasks: number
	setIsCreateSprintModalOpen: Dispatch<SetStateAction<boolean>>
	setAddingToSprintId: Dispatch<SetStateAction<string | null | undefined>>
}

export const BacklogHeader = ({
	sprints,
	tasks,
	setIsCreateSprintModalOpen,
	setAddingToSprintId,
}: BacklogHeaderProps) => {
	const { canManageSprints } = useProjectPermissions()

	return (
		<div className={classes.header}>
			<div className={classes.stats}>
				<span className={classes.badge}>{tasks} total tasks</span>
				<span className={classes.subtitle}>• {sprints} sprints</span>
			</div>
			<div className={classes.headerActions}>
				{canManageSprints && (
					<button className={classes.createSprintBtn} onClick={() => setIsCreateSprintModalOpen(true)}>
						<PlusIcon />
						<span>Create Sprint</span>
					</button>
				)}
				<button className={classes.addButton} onClick={() => setAddingToSprintId(null)}>
					<PlusIcon />
					<span>Add to Backlog</span>
				</button>
			</div>
		</div>
	)
}
