'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowBottomIcon } from '../icons/arrow-bottom-icon'
import { InfoIcon } from '../icons/projects/info-icon'
import { RouteOffIcon } from '../icons/route-off-icon'
import classes from './not-found.module.scss'

const quickLinks = [
	{ label: 'Dashboard', href: '/' },
	{ label: 'Planner', href: '/planner' },
	{ label: 'Notes', href: '/notes' },
]

export const NotFoundPage = () => {
	const router = useRouter()

	return (
		<div className={classes.inner}>
			<div className={classes.card}>
				<span className={classes.badge}>Error 404</span>
				<div className={classes.iconWrap}>
					<RouteOffIcon strokeWidth={1.5} />
				</div>
				<h2 className={classes.title}>Oops.</h2>
				<p className={classes.subtitle}>This page doesn&apos;t exist</p>
				<div className={classes.divider} />
				<p className={classes.hint}>
					<InfoIcon />
					Maybe you were looking for:
				</p>
				<div className={classes.chips}>
					{quickLinks.map(({ label, href }) => (
						<Link key={href} href={href} className={classes.chip}>
							{label}
						</Link>
					))}
				</div>
				<button onClick={() => router.back()} className={classes.backLink}>
					<ArrowBottomIcon style={{ rotate: '90deg' }} strokeWidth={1.5} />
					Go back
				</button>
			</div>
		</div>
	)
}
