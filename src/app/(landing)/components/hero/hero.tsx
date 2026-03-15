import Image from 'next/image'
import Link from 'next/link'
import classes from './hero.module.scss'

export const Hero = () => {
	return (
		<section className={classes.hero}>
			<div className={classes.container}>
				<h1 className={classes.title}>
					Clarity starts <span className={classes.highlight}>here</span>
				</h1>
				<p className={classes.subtitle}>
					One place for everything that matters. Calendar, planner, projects, focus timers, journal, and notes — unified
					in a single, beautiful workspace.
				</p>
				<div className={classes.cta}>
					<Link href='/signup' className={classes.primaryBtn}>
						Get started free
					</Link>
				</div>
				<Image src={'/dashboard.png'} alt='Dashboard image' width={1200} height={677} className={classes.heroImage} />
			</div>
		</section>
	)
}
