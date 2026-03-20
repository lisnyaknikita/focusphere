import { useToggleFavorite } from '@/shared/hooks/projects/use-toggle-favorite'
import { Project } from '@/shared/types/project'
import { FavoriteIcon } from '@/shared/ui/icons/projects/favorite-icon'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { OwnerAvatar } from './components/owner-avatar/owner-avatar'
import classes from './project-card.module.scss'

interface ProjectCardProps {
	project: Project
	onRefresh: () => Promise<void>
}

export const getRelativeTime = (date: string | Date) => {
	return formatDistanceToNow(new Date(date), {
		addSuffix: true,
	})
}

export const ProjectCard = ({ project, onRefresh }: ProjectCardProps) => {
	const { handleToggleFavorite } = useToggleFavorite({ onRefresh, project })

	return (
		<li className={classes.projectCard}>
			<header className={classes.logo}>Project logo</header>
			<main className={classes.projectInfo}>
				<div className={classes.title}>
					<Link href={`/projects/${project.$id}/board`}>
						<h6>{project.title}</h6>
					</Link>
					<button
						className={clsx(classes.favoriteButton, project.isFavorite && 'favorite')}
						onClick={handleToggleFavorite}
					>
						<FavoriteIcon width={16} height={16} />
					</button>
				</div>
				<p className={classes.description}>{project.description || ''}</p>
				<div className={classes.moreInfo}>
					<ul className={classes.teamMembers}>
						<li className={classes.avatar}>
							<OwnerAvatar userId={project.ownerId} size={30} />
						</li>
					</ul>
					<div className={classes.updateDate}>Updated {getRelativeTime(project.$updatedAt)}</div>
				</div>
			</main>
		</li>
	)
}
