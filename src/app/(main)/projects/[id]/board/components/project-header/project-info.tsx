'use client'

import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useTeamCount } from '@/shared/hooks/projects/use-team-count'
import { Project } from '@/shared/types/project'
import { MembersIcon } from '@/shared/ui/icons/projects/members-icon'
import { ProjectSettingsIcon } from '@/shared/ui/icons/projects/project-settings-icon'
import { TasksIcon } from '@/shared/ui/icons/projects/tasks-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import classes from './project-info.module.scss'
import { ProjectSettingsModal } from './project-settings-modal/project-settings-modal'

interface ProjectInfoProps {
	project: Project
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
	const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)

	const { tasks, isLoading } = useKanban(project!)

	const membersCount = useTeamCount(project.teamId, project.type)

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	return (
		<>
			<div className={classes.projectInfo}>
				<div className={classes.info}>
					<h3 className={classes.projectTitle}>{project?.title}</h3>
					<p className={classes.projectSubtitle}>{project?.description}</p>
					<div className={classes.infoWithIcons}>
						<div className={classes.members}>
							<MembersIcon />
							<span>
								{membersCount} {membersCount === 1 ? 'team member' : 'team members'}
							</span>
						</div>
						<div className={classes.tasks}>
							<TasksIcon />
							<span>{isLoading ? '' : `${tasks.length} ${tasks.length > 1 ? 'tasks' : 'task'}`}</span>
						</div>
					</div>
				</div>
				<button
					ref={refs.setReference}
					className={classes.settingsButton}
					onClick={() => setIsProjectSettingsModalOpen(true)}
					{...getReferenceProps()}
				>
					<ProjectSettingsIcon />
				</button>
				{isTooltipOpen && (
					<div
						ref={refs.setFloating}
						style={{
							...floatingStyles,
							background: 'var(--save-button-bg)',
							color: 'var(--save-button-text)',
							padding: '4px 8px',
							borderRadius: '5px',
							fontSize: '13px',
							fontWeight: 700,
							zIndex: 1000,
							whiteSpace: 'nowrap',
						}}
						{...getFloatingProps()}
					>
						Project settings
					</div>
				)}
			</div>
			<Modal isVisible={isProjectSettingsModalOpen} onClose={() => setIsProjectSettingsModalOpen(false)}>
				<ProjectSettingsModal project={project} onClose={() => setIsProjectSettingsModalOpen(false)} />
			</Modal>
		</>
	)
}
