import { ChatIcon } from '@/shared/ui/icons/landing/chat-icon'
import { LinkIcon } from '@/shared/ui/icons/landing/link-icon'
import { ProjectNotesIcon } from '@/shared/ui/icons/landing/project-notes-icon'
import { RealTimeUpdatesIcon } from '@/shared/ui/icons/landing/real-time-updates-icon'
import classes from './team-collab.module.scss'

const features = [
	{
		icon: <LinkIcon />,
		title: 'Invite by link',
		description: 'Share a link and onboard teammates instantly.',
	},
	{
		icon: <RealTimeUpdatesIcon />,
		title: 'Real-time updates',
		description: 'See changes as they happen, no refresh needed.',
	},
	{
		icon: <ChatIcon />,
		title: 'Project chat',
		description: 'Discuss tasks without leaving the app.',
	},
	{
		icon: <ProjectNotesIcon />,
		title: 'Project notes',
		description: 'Capture ideas and important details directly inside each project.',
	},
]

export const TeamCollab = () => {
	return (
		<section className={classes.teamCollab}>
			<div className={classes.container}>
				<div className={classes.content}>
					<span className={classes.label}>Team Collaboration</span>
					<h2 className={classes.title}>Solo or team — Focusphere adapts to you</h2>
					<p className={classes.subtitle}>Work alone or bring your team. All the tools you need to stay in sync.</p>
					<div className={classes.features}>
						{features.map((feature, index) => (
							<div key={index} className={classes.feature}>
								<div className={classes.featureIcon}>{feature.icon}</div>
								<div className={classes.featureContent}>
									<h4 className={classes.featureTitle}>{feature.title}</h4>
									<p className={classes.featureDescription}>{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className={classes.visual}>
					<div className={classes.board}>
						<div className={classes.boardHeader}>
							<span className={classes.boardTitle}>Team Project</span>
							<div className={classes.teamAvatars}>
								<span className={classes.teamAvatar} data-color='blue'>
									A
								</span>
								<span className={classes.teamAvatar} data-color='green'>
									M
								</span>
								<span className={classes.teamAvatar} data-color='purple'>
									S
								</span>
								<span className={classes.teamAvatar} data-color='orange'>
									J
								</span>
								<span className={classes.teamAvatarMore}>+3</span>
							</div>
						</div>
						<div className={classes.boardContent}>
							<div className={classes.activityItem}>
								<span className={classes.activityAvatar} data-color='blue'>
									A
								</span>
								<div className={classes.activityText}>
									<strong>Anna</strong> moved task to <span className={classes.statusBadge}>Done</span>
								</div>
								<span className={classes.activityTime}>2m ago</span>
							</div>
							<div className={classes.activityItem}>
								<span className={classes.activityAvatar} data-color='green'>
									M
								</span>
								<div className={classes.activityText}>
									<strong>Mike</strong> commented on &quot;API Integration&quot;
								</div>
								<span className={classes.activityTime}>5m ago</span>
							</div>
							<div className={classes.activityItem}>
								<span className={classes.activityAvatar} data-color='purple'>
									S
								</span>
								<div className={classes.activityText}>
									<strong>Sarah</strong> created new task
								</div>
								<span className={classes.activityTime}>12m ago</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
