'use client'

import classes from './features.module.scss'

const features = [
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
		title: 'Calendar',
		description: 'Plan your days with a smart calendar. Schedule events, set reminders, and never miss an important moment.',
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			</svg>
		),
		title: 'Projects',
		description: 'Organize your work with project boards. Track tasks, collaborate with teams, and hit every deadline.',
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12,6 12,12 16,14" />
			</svg>
		),
		title: 'Focus Timer',
		description: 'Deep work sessions with Pomodoro-style timers. Background sounds and stats to keep you in the zone.',
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14,2 14,8 20,8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
				<line x1="10" y1="9" x2="8" y2="9" />
			</svg>
		),
		title: 'Journal',
		description: 'Reflect on your day with guided journal prompts. Track moods, gratitude, and personal growth over time.',
	},
	{
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
		),
		title: 'Notes',
		description: 'Capture ideas instantly with a rich text editor. Organize with tags and find anything in seconds.',
	},
]

export const Features = () => {
	return (
		<section id="features" className={classes.features}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Features</span>
					<h2 className={classes.title}>Everything you need to stay productive</h2>
					<p className={classes.subtitle}>
						Five powerful tools, one unified workspace. No more switching between apps.
					</p>
				</div>

				<div className={classes.grid}>
					{features.map((feature, index) => (
						<div key={index} className={classes.card}>
							<div className={classes.iconWrapper}>{feature.icon}</div>
							<h3 className={classes.cardTitle}>{feature.title}</h3>
							<p className={classes.cardDescription}>{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
