'use client'

import { useLandingTheme } from '@/app/(landing)/landing-theme-context'
import Image from 'next/image'
import classes from './features.module.scss'

const featuresConfig = [
	{
		number: '01',
		label: 'Central Control',
		title: 'Command center & instantaneous idea capture',
		description:
			"Your personal workspace, organized your way. Track today's tasks and scheduled events alongside customizable widgets — swap seamlessly between Pomodoro stats, time-blocks, and daily motivation. Instantly capture quick ideas the moment they strike so you never forget them, and clear your mind before bed.",
		imageBase: 'dashboard-feature',
		width: 620,
		height: 350,
		reverse: false,
	},
	{
		number: '02',
		label: 'Time Management',
		title: 'Time-blocking built for real productivity',
		description:
			'Structure your week around how your brain actually works. Block out deep work sessions, build daily task checklists, and maintain a predictable workflow.',
		imageBase: 'planner',
		width: 620,
		height: 350,
		reverse: true,
	},
	{
		number: '03',
		label: 'Project Execution',
		title: 'Sprints, Backlog, and Kanban boards without the bloat',
		description:
			'Full-featured Agile workspace built for clarity. Take projects from raw backlog to active sprints, visualize your work on clean Kanban boards, and maintain total control with built-in permission roles',
		imageBase: 'kanban',
		width: 620,
		height: 350,
		reverse: false,
	},
	{
		number: '04',
		label: 'Deep Work',
		title: 'Deep work timer with focus sounds & mini-player',
		description:
			'Maintain your flow state with ambient focus sounds and a flexible Pomodoro timer. Minimize the player to follow you across any page without interrupting your momentum.',
		imageBase: 'timer',
		width: 620,
		height: 326,
		reverse: true,
	},
	{
		number: '05',
		label: 'Knowledge & Reflection',
		title: 'Notes & customizable journal',
		description:
			'Combine notes and personal journaling in one place. Write freely with a powerful rich-text editor, speed up your entry with built-in templates, or design custom ones to fit your style',
		imageBase: 'journal',
		width: 620,
		height: 350,
		reverse: false,
	},
]

export const Features = () => {
	const { theme } = useLandingTheme()

	return (
		<section id='features' className={classes.features}>
			<div className={classes.container}>
				{featuresConfig.map((feature, index) => {
					const src = `/${feature.imageBase}-${theme}.avif`

					return (
						<div key={index} className={classes.featureRow} data-reverse={feature.reverse}>
							<div className={classes.featureContent}>
								<div className={classes.featureMeta}>
									<span className={classes.featureNumber}>{feature.number}</span>
									<span className={classes.featureLabel}>{feature.label}</span>
								</div>
								<h3 className={classes.featureTitle}>{feature.title}</h3>
								<p className={classes.featureDescription}>{feature.description}</p>
							</div>
							<div className={classes.featureVisual}>
								<Image src={src} alt={feature.title} width={feature.width} height={feature.height} loading='lazy' />
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}
