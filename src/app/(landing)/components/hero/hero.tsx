'use client'

import { useLandingTheme } from '@/app/(landing)/landing-theme-context'
import Image from 'next/image'
import Link from 'next/link'
import classes from './hero.module.scss'

export const Hero = () => {
	const { theme } = useLandingTheme()

	return (
		<section className={classes.hero}>
			<div className={classes.container}>
				<div className={classes.badge}>All-in-one productivity workspace</div>
				<h1 className={classes.title}>
					Clarity starts <span className={classes.highlight}>here</span>
				</h1>
				<p className={classes.subtitle}>
					Calendar, planner, projects, focus timer, journal, and notes — all in one beautiful workspace.
					Stop switching apps. Start getting things done.
				</p>
				<div className={classes.cta}>
					<Link href='/signup' className={classes.primaryBtn}>
						Get started — it&apos;s free
					</Link>
					<a href='#features' className={classes.secondaryBtn}>
						See features ↓
					</a>
				</div>
				<div className={classes.imageWrapper}>
					<Image
						src={`/dashboard-${theme}.png`}
						alt='Focusphere dashboard'
						width={1200}
						height={677}
						className={classes.heroImage}
						priority
					/>
				</div>
			</div>
		</section>
	)
}
