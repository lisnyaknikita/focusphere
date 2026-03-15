'use client'

import classes from './testimonials.module.scss'

const testimonials = [
	{
		quote: "Focusphere has completely transformed how I manage my work. The focus timer combined with the journal helps me stay accountable and reflective.",
		name: 'Sarah Chen',
		role: 'Product Designer',
		avatar: 'SC',
	},
	{
		quote: "Finally, an app that doesn't make me jump between 5 different tools. Everything I need is in one place. My team loves the project boards.",
		name: 'Marcus Johnson',
		role: 'Engineering Lead',
		avatar: 'MJ',
	},
	{
		quote: "The calendar integration with focus timers is genius. I block time for deep work and actually get things done. Best productivity app I've used.",
		name: 'Elena Rodriguez',
		role: 'Freelance Writer',
		avatar: 'ER',
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
							<p className={classes.quote}>"{testimonial.quote}"</p>
							<div className={classes.author}>
								<div className={classes.avatar}>{testimonial.avatar}</div>
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
