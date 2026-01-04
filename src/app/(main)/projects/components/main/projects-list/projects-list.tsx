import { ProjectCard } from './project-card/project-card'
import classes from './projects-list.module.scss'

export const ProjectsList = () => {
	return (
		<ul className={classes.projectsList}>
			<ProjectCard />
			<ProjectCard />
			<ProjectCard />
			<ProjectCard />
		</ul>
	)
}
