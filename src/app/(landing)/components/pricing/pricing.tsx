'use client'

import Link from 'next/link'
import classes from './pricing.module.scss'

const plans = [
	{
		name: 'Free',
		price: '$0',
		period: 'forever',
		description: 'Perfect for getting started',
		features: [
			'Core features',
			'1 project',
			'Basic timer',
			'7-day history',
		],
		cta: 'Get started',
		highlighted: false,
	},
	{
		name: 'Pro',
		price: '$9',
		period: '/month',
		description: 'For power users',
		features: [
			'Everything in Free',
			'Unlimited projects',
			'Journal templates',
			'Ambient sounds',
			'Unlimited history',
			'Priority support',
		],
		cta: 'Start free trial',
		highlighted: true,
	},
	{
		name: 'Team',
		price: '$19',
		period: '/user/month',
		description: 'For teams and collaboration',
		features: [
			'Everything in Pro',
			'Shared workspace',
			'Team chat',
			'Admin controls',
			'Analytics dashboard',
			'SSO & advanced security',
		],
		cta: 'Contact sales',
		highlighted: false,
	},
]

export const Pricing = () => {
	return (
		<section id="pricing" className={classes.pricing}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Pricing</span>
					<h2 className={classes.title}>Simple, transparent pricing</h2>
					<p className={classes.subtitle}>
						Start free. Upgrade when you need more.
					</p>
				</div>

				<div className={classes.grid}>
					{plans.map((plan, index) => (
						<div
							key={index}
							className={classes.card}
							data-highlighted={plan.highlighted}
						>
							{plan.highlighted && (
								<span className={classes.badge}>Most Popular</span>
							)}
							<div className={classes.cardHeader}>
								<h3 className={classes.planName}>{plan.name}</h3>
								<div className={classes.priceWrapper}>
									<span className={classes.price}>{plan.price}</span>
									<span className={classes.period}>{plan.period}</span>
								</div>
								<p className={classes.description}>{plan.description}</p>
							</div>

							<ul className={classes.features}>
								{plan.features.map((feature, i) => (
									<li key={i} className={classes.feature}>
										<svg className={classes.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="20,6 9,17 4,12" />
										</svg>
										{feature}
									</li>
								))}
							</ul>

							<Link
								href="/signup"
								className={classes.cta}
								data-highlighted={plan.highlighted}
							>
								{plan.cta}
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
