import Link from 'next/link'
import classes from './final-cta.module.scss'

export const FinalCTA = () => {
	return (
		<section className={classes.finalCta}>
			<div className={classes.container}>
				<h2 className={classes.title}>Ready to focus on what matters?</h2>
				<p className={classes.subtitle}>
					Join thousands of people who are already more productive with Focusphere. Start your journey today - it&apos;s
					free.
				</p>
				<div className={classes.actions}>
					<Link href='/signup' className={classes.primaryBtn}>
						Get started for free
					</Link>
					<Link href='/login' className={classes.secondaryBtn}>
						Log in
					</Link>
				</div>
			</div>
		</section>
	)
}
