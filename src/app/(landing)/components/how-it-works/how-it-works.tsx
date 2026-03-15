'use client'

import classes from './how-it-works.module.scss'

const steps = [
	{
		number: '01',
		title: 'Create your account',
		description: 'Sign up in seconds with your email or Google account. No credit card required.',
	},
	{
		number: '02',
		title: 'Set up your workspace',
		description: 'Customize your dashboard. Add projects, set goals, and configure your preferences.',
	},
	{
		number: '03',
		title: 'Stay focused & productive',
		description: 'Use timers, track progress, journal your thoughts, and watch your productivity soar.',
	},
]

export const HowItWorks = () => {
	return (
		<section id="how-it-works" className={classes.howItWorks}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>How it works</span>
					<h2 className={classes.title}>Get started in 3 simple steps</h2>
				</div>

				<div className={classes.steps}>
					{steps.map((step, index) => (
						<div key={index} className={classes.step}>
							<div className={classes.stepNumber}>{step.number}</div>
							<div className={classes.stepContent}>
								<h3 className={classes.stepTitle}>{step.title}</h3>
								<p className={classes.stepDescription}>{step.description}</p>
							</div>
							{index < steps.length - 1 && <div className={classes.connector} />}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
