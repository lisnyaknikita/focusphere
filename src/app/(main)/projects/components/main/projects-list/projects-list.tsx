import { Project } from '@/shared/types/project'
import clsx from 'clsx'
import { BeatLoader } from 'react-spinners'
import { ProjectCard } from './project-card/project-card'
import classes from './projects-list.module.scss'

interface ProjectsListProps {
	projects: Project[]
	isLoading: boolean
	isFetching: boolean
}

export const ProjectsList = ({ projects, isLoading, isFetching }: ProjectsListProps) => {
	if (isLoading) return <BeatLoader color='#aaa' size={10} className={classes.loader} />

	if (projects.length === 0) return <p className={classes.noProjectsMessage}>No projects</p>

	return (
		<ul className={clsx(classes.projectsList, isFetching && classes.fetching)}>
			{projects.map(project => (
				<ProjectCard key={project.$id} project={project} />
			))}
		</ul>
	)
}
