import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { useTeamMembers } from '@/shared/hooks/projects/use-team-members'
import { useToggleFavorite } from '@/shared/hooks/projects/use-toggle-favorite'
import { Project } from '@/shared/types/project'
import { FavoriteIcon } from '@/shared/ui/icons/projects/favorite-icon'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { BeatLoader } from 'react-spinners'
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
	const { data: teammates = [], isLoading } = useTeamMembers(project.teamId)

	const projectColor = project.color || CALENDAR_COLORS.GOLD

	const displayMembers = project.type === 'solo' ? [{ userId: project.ownerId }] : teammates.slice(0, 3)

	return (
		<li className={classes.projectCard}>
			<span className={classes.colorLine} style={{ backgroundColor: projectColor }}></span>
			<main className={classes.projectInfo}>
				<div className={classes.title}>
					<Link href={`/projects/${project.$id}/board`} title={project.title || ''}>
						<h6>{project.title}</h6>
					</Link>
					<button
						className={clsx(classes.favoriteButton, project.isFavorite && 'favorite')}
						onClick={handleToggleFavorite}
					>
						<FavoriteIcon width={16} height={16} />
					</button>
				</div>
				<p className={classes.description} title={project.description || ''}>
					{project.description || 'No description'}
				</p>
				<div className={classes.moreInfo}>
					<ul className={classes.teamMembers}>
						{isLoading && project.type === 'team' ? (
							<li className={classes.avatar}>
								<BeatLoader color='#aaa' size={10} style={{ height: 34.5 }} />
							</li>
						) : (
							displayMembers.map((member, index) => (
								<li key={member.userId || index} className={classes.avatar} style={{ zIndex: 10 - index }}>
									<OwnerAvatar userId={member.userId} size={30} />
								</li>
							))
						)}
						{!isLoading && project.type === 'team' && teammates.length > 3 && (
							<li className={classes.moreCount}>+{teammates.length - 3}</li>
						)}
					</ul>
					<div className={classes.updateDate}>Updated {getRelativeTime(project.$updatedAt)}</div>
				</div>
			</main>
		</li>
	)
}
