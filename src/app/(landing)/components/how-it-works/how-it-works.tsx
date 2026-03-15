'use client'

import classes from './how-it-works.module.scss'

const steps = [
	{
		number: 1,
		title: 'Create your account',
		description: 'Sign up in seconds. No credit card needed.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		),
	},
	{
		number: 2,
		title: 'Set up your space',
		description: 'Add your projects, tasks and calendar.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				<line x1="3" y1="9" x2="21" y2="9" />
				<line x1="9" y1="21" x2="9" y2="9" />
			</svg>
		),
	},
	{
		number: 3,
		title: 'Stay in flow',
		description: 'Use timer, plan your week, reflect daily.',
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12,6 12,12 16,14" />
			</svg>
		),
	},
]

export const HowItWorks = () => {
	return (
		<section id="how-it-works" className={classes.howItWorks}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>How it works</span>
					<h2 className={classes.title}>3 steps to productivity</h2>
				</div>

				<div className={classes.stepper}>
					{steps.map((step, index) => (
						<div key={index} className={classes.step}>
							<div className={classes.stepIcon}>
								{step.icon}
								<span className={classes.stepNumber}>{step.number}</span>
							</div>
							<h3 className={classes.stepTitle}>{step.title}</h3>
							<p className={classes.stepDescription}>{step.description}</p>
							{index < steps.length - 1 && <div className={classes.connector} />}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
