'use client'

import { useLandingTheme } from '@/app/(landing)/landing-theme-context'
import { ChatIcon } from '@/shared/ui/icons/landing/chat-icon'
import { LinkIcon } from '@/shared/ui/icons/landing/link-icon'
import { ProjectNotesIcon } from '@/shared/ui/icons/landing/project-notes-icon'
import { SecurityIcon } from '@/shared/ui/icons/landing/security-icon'
import Image from 'next/image'
import classes from './team-collab.module.scss'

const features = [
	{
		icon: <LinkIcon />,
		title: 'Invite by email',
		description: 'Send email invites to onboard teammates to your project workspace in seconds.',
	},
	{
		icon: <SecurityIcon />,
		title: 'Owner-controlled sprints',
		description:
			"Give your team full freedom over tasks while sprint lifecycle management stays securely in the owner's hands",
	},
	{
		icon: <ChatIcon />,
		title: 'In-Context Chat',
		description: 'Keep team discussions right alongside your tasks and backlogs on the very same screen.',
	},
	{
		icon: <ProjectNotesIcon />,
		title: 'Shared Project Notes',
		description: 'Keep documentation, decisions, and technical context right beside your Kanban tasks.',
	},
]

export const TeamCollab = () => {
	const { theme } = useLandingTheme()

	return (
		<section id='team' className={classes.teamCollab}>
			<div className={classes.container}>
				<div className={classes.content}>
					<span className={classes.label}>Team Collaboration</span>
					<h2 className={classes.title}>Solo-first, team-ready</h2>
					<p className={classes.subtitle}>
						Start as an individual creator, bring your team when you grow. Stay aligned without setup hassle.
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
						src={`/chat-${theme}.avif`}
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
