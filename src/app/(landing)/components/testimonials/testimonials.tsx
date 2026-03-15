'use client'

import classes from './testimonials.module.scss'

const testimonials = [
	{
		quote: "I replaced Notion, Todoist, and a physical planner with Focusphere. My mornings are completely different now.",
		name: 'Anna K.',
		role: 'Freelance Designer',
		avatar: 'AK',
		color: 'purple',
	},
	{
		quote: "The focus timer with ambient sounds changed everything. I used to struggle with deep work — now I look forward to it.",
		name: 'Marcus Chen',
		role: 'Software Engineer',
		avatar: 'MC',
		color: 'blue',
	},
	{
		quote: "Finally, one app for my whole team. We ditched 4 subscriptions and everyone's happier with the unified workspace.",
		name: 'Sarah Rodriguez',
		role: 'Product Manager',
		avatar: 'SR',
		color: 'green',
	},
]

export const Testimonials = () => {
	return (
		<section id="testimonials" className={classes.testimonials}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Testimonials</span>
					<h2 className={classes.title}>Loved by productive people</h2>
				</div>

				<div className={classes.grid}>
					{testimonials.map((testimonial, index) => (
						<div key={index} className={classes.card}>
							<div className={classes.quoteIcon}>
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
								</svg>
							</div>
							<p className={classes.quote}>{testimonial.quote}</p>
							<div className={classes.author}>
								<div className={classes.avatar} data-color={testimonial.color}>
									{testimonial.avatar}
								</div>
								<div className={classes.authorInfo}>
									<span className={classes.name}>{testimonial.name}</span>
									<span className={classes.role}>{testimonial.role}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
