import classes from './team-collab.module.scss'

const features = [
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
				<path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
			</svg>
		),
		title: 'Invite by link',
		description: 'Share a link and onboard teammates instantly.',
	},
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<polyline points='23,6 13.5,15.5 8.5,10.5 1,18' />
				<polyline points='17,6 23,6 23,12' />
			</svg>
		),
		title: 'Real-time updates',
		description: 'See changes as they happen, no refresh needed.',
	},
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
			</svg>
		),
		title: 'Project chat',
		description: 'Discuss tasks without leaving the app.',
	},
	{
		icon: (
			<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<rect x='4' y='3' width='16' height='18' rx='2' stroke='currentColor' strokeWidth='1.8' />
				<line x1='7' y1='8' x2='17' y2='8' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
				<line x1='7' y1='12' x2='17' y2='12' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
				<line x1='7' y1='16' x2='13' y2='16' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
			</svg>
		),
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
