'use client'

import Link from 'next/link'
import classes from './hero.module.scss'

export const Hero = () => {
	return (
		<section className={classes.hero}>
			<div className={classes.container}>
				<div className={classes.badge}>
					<span className={classes.badgeDot} />
					<span>All-in-one productivity platform</span>
				</div>

				<h1 className={classes.title}>
					Focus on what matters.
					<br />
					<span className={classes.highlight}>Achieve more.</span>
				</h1>

				<p className={classes.subtitle}>
					Focusphere combines calendar, projects, focus timers, journal, and notes into one
					seamless workspace. Stay organized, stay productive, stay in the zone.
				</p>

				<div className={classes.cta}>
					<Link href="/signup" className={classes.primaryBtn}>
						Start for free
					</Link>
					<a href="#features" className={classes.secondaryBtn}>
						Learn more
					</a>
				</div>

				<div className={classes.preview}>
					<div className={classes.previewWindow}>
						<div className={classes.windowHeader}>
							<span className={classes.dot} />
							<span className={classes.dot} />
							<span className={classes.dot} />
						</div>
						<div className={classes.windowContent}>
							<div className={classes.sidebar}>
								<div className={classes.sidebarItem} />
								<div className={classes.sidebarItem} />
								<div className={classes.sidebarItem} />
								<div className={classes.sidebarItem} />
								<div className={classes.sidebarItem} />
							</div>
							<div className={classes.mainContent}>
								<div className={classes.contentHeader} />
								<div className={classes.contentGrid}>
									<div className={classes.card} />
									<div className={classes.card} />
									<div className={classes.card} />
									<div className={classes.card} />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className={classes.stats}>
					<div className={classes.stat}>
						<span className={classes.statNumber}>10k+</span>
						<span className={classes.statLabel}>Active users</span>
					</div>
					<div className={classes.statDivider} />
					<div className={classes.stat}>
						<span className={classes.statNumber}>98%</span>
						<span className={classes.statLabel}>Satisfaction rate</span>
					</div>
					<div className={classes.statDivider} />
					<div className={classes.stat}>
						<span className={classes.statNumber}>4.9</span>
						<span className={classes.statLabel}>Average rating</span>
					</div>
				</div>
			</div>
		</section>
	)
}
