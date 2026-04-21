import { ChatIcon } from '@/shared/ui/icons/landing/chat-icon'
import { LinkIcon } from '@/shared/ui/icons/landing/link-icon'
import { ProjectNotesIcon } from '@/shared/ui/icons/landing/project-notes-icon'
import { RealTimeUpdatesIcon } from '@/shared/ui/icons/landing/real-time-updates-icon'
import Image from 'next/image'
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
		description: 'Discuss tasks directly inside your project — no side tabs.',
	},
	{
		icon: <ProjectNotesIcon />,
		title: 'Shared notes',
		description: 'Capture decisions and context right alongside your work.',
	},
]

export const TeamCollab = () => {
	return (
		<section className={classes.teamCollab}>
			<div className={classes.container}>
				<div className={classes.content}>
					<span className={classes.label}>Team Collaboration</span>
					<h2 className={classes.title}>Solo or team — Focusphere adapts to you</h2>
					<p className={classes.subtitle}>
						Work alone or bring your whole team. Everything you need to stay aligned lives in one place.
					</p>
					<div className={classes.featuresList}>
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
					<Image
						src='/chat.png'
						alt='Team chat in Focusphere'
						width={560}
						height={380}
						loading='lazy'
						className={classes.chatImage}
					/>
				</div>
			</div>
		</section>
	)
}
