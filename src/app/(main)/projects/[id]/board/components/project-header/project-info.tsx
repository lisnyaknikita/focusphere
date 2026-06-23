'use client'

import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { Project } from '@/shared/types/project'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { ProjectSettingsIcon } from '@/shared/ui/icons/projects/project-settings-icon'
import { TasksIcon } from '@/shared/ui/icons/projects/tasks-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import classes from './project-info.module.scss'
import { ProjectSettingsModal } from './project-settings-modal/project-settings-modal'
import { TeamMembersCounter } from './team-members-counter/team-members-counter'

interface ProjectInfoProps {
	project: Project
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
	const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false)

	const { tasks, isLoading } = useKanban(project)

	const tasksWord = tasks.length === 1 ? 'task' : 'tasks'

	return (
		<>
			<div className={classes.projectInfo}>
				<div className={classes.info}>
					<h3 className={classes.projectTitle}>{project.title}</h3>
					<p className={classes.projectSubtitle}>{project.description}</p>
					<div className={classes.infoWithIcons}>
						<TeamMembersCounter teamId={project.teamId} projectType={project.type} />
						<div className={classes.tasks}>
							<TasksIcon />
							<span>{isLoading ? '...' : `${tasks.length} ${tasksWord}`}</span>
						</div>
					</div>
				</div>
				<ActionTooltip text='Project settings'>
					{(setRef, refProps) => (
						<button
							ref={setRef}
							className={classes.settingsButton}
							onClick={() => setIsProjectSettingsModalOpen(true)}
							{...refProps}
						>
							<ProjectSettingsIcon />
						</button>
					)}
				</ActionTooltip>
			</div>
			<Modal isVisible={isProjectSettingsModalOpen} onClose={() => setIsProjectSettingsModalOpen(false)}>
				<ProjectSettingsModal project={project} onClose={() => setIsProjectSettingsModalOpen(false)} />
			</Modal>
		</>
	)
}
