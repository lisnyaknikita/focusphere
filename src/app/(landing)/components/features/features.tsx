import Image from 'next/image'
import classes from './features.module.scss'

const features = [
	{
		title: 'Kanban Board',
		description:
			'Visualise your work with drag-and-drop columns and cards. Track progress at a glance — from To Do to Done — and keep your whole team on the same page.',
		image: { src: '/kanban.png', width: 620, height: 350 },
		reverse: false,
	},
	{
		title: 'Planner',
		description:
			'Block out your day the way your brain works. Set time blocks, add goals and tasks, and build a daily routine that actually sticks.',
		image: { src: '/planner.png', width: 620, height: 350 },
		reverse: true,
	},
	{
		title: 'Focus Timer',
		description:
			'Deep work on demand. Choose from Pink noise, Brown noise, or Lofi music, set your timer, and enter a flow state you can actually sustain.',
		image: { src: '/timer.png', width: 620, height: 326 },
		reverse: false,
	},
	{
		title: 'Journal',
		description:
			'A private space to reflect. Write guided entries, track how you feel over time, and build the habit of intentional self-reflection.',
		image: { src: '/journal.png', width: 620, height: 350 },
		reverse: true,
	},
]

export const Features = () => {
	return (
		<section id='features' className={classes.features}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Features</span>
					<h2 className={classes.title}>Everything in one place</h2>
					<p className={classes.subtitle}>
						All your productivity tools, unified in one workspace. No more context-switching.
					</p>
				</div>

				{features.map((feature, index) => (
					<div key={index} className={classes.featureRow} data-reverse={feature.reverse}>
						<div className={classes.featureContent}>
							<h3 className={classes.featureTitle}>{feature.title}</h3>
							<p className={classes.featureDescription}>{feature.description}</p>
						</div>
						<div className={classes.featureVisual}>
							<Image
								src={feature.image.src}
								alt={feature.title}
								width={feature.image.width}
								height={feature.image.height}
								loading='lazy'
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
