import classes from './testimonials.module.scss'

const testimonials = [
	{
		quote:
			'I canceled Notion, Todoist, and my focus sound app. Focusphere replaced them all seamlessly into one clean workflow.',
		name: 'Anna K.',
		role: 'Freelance Product Designer',
		avatar: 'AK',
		color: 'purple',
	},
	{
		quote:
			'Having our backlog, active sprints, and team chat integrated into one workspace is a game changer. It stripped away all the usual project management bloat for us.',
		name: 'Marcus Chen',
		role: 'Lead Software Engineer',
		avatar: 'MC',
		color: 'blue',
	},
	{
		quote:
			'I love that no idea gets lost anymore. Capturing thoughts instantly and having an evening prompt to process them completely cleared my mind at the end of the day.',
		name: 'Sarah Rodriguez',
		role: 'Founder & Product Lead',
		avatar: 'SR',
		color: 'green',
	},
]

const Stars = () => (
	<div className={classes.stars}>
		{[...Array(5)].map((_, i) => (
			<svg key={i} width='16' height='16' viewBox='0 0 16 16' fill='#f59e0b'>
				<path d='M8 1.2l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1l-3.6 1.9.7-4L2.2 5.4l4-.6z' />
			</svg>
		))}
	</div>
)

export const Testimonials = () => {
	return (
		<section id='testimonials' className={classes.testimonials}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Testimonials</span>
					<h2 className={classes.title}>Loved by productive professionals</h2>
				</div>
				<div className={classes.grid}>
					{testimonials.map((testimonial, index) => (
						<div key={index} className={classes.card}>
							<Stars />
							<p className={classes.quote}>&ldquo;{testimonial.quote}&rdquo;</p>
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
