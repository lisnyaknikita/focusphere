'use client'

import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useTeamCount } from '@/shared/hooks/projects/use-team-count'
import { Project } from '@/shared/types/project'
import { MembersIcon } from '@/shared/ui/icons/projects/members-icon'
import { ProjectSettingsIcon } from '@/shared/ui/icons/projects/project-settings-icon'
import { TasksIcon } from '@/shared/ui/icons/projects/tasks-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import classes from './project-info.module.scss'
import { ProjectSettingsModal } from './project-settings-modal/project-settings-modal'

interface ProjectInfoProps {
	project: Project
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
	const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false)
	const { tasks, isLoading } = useKanban(project!)

	const membersCount = useTeamCount(project.teamId, project.type)

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
				<button className={classes.settingsButton} onClick={() => setIsProjectSettingsModalOpen(true)}>
					<ProjectSettingsIcon />
				</button>
			</div>
			<Modal isVisible={isProjectSettingsModalOpen} onClose={() => setIsProjectSettingsModalOpen(false)}>
				<ProjectSettingsModal project={project} onClose={() => setIsProjectSettingsModalOpen(false)} />
			</Modal>
		</>
	)
}
