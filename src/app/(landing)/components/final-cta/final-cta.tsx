import Link from 'next/link'
import classes from './final-cta.module.scss'

export const FinalCTA = () => {
	return (
		<section className={classes.finalCta}>
			<div className={classes.container}>
				<h2 className={classes.title}>Ready to eliminate app switching for good?</h2>
				<p className={classes.subtitle}>
					Join thousands of creators and teams organizing their work with Focusphere. 100% free during our
					public beta.
				</p>
				<div className={classes.actions}>
					<Link href='/signup' className={classes.primaryBtn}>
						Get started — it&apos;s free
					</Link>
					<Link href='/login' className={classes.secondaryBtn}>
						Log in
					</Link>
				</div>
			</div>
		</section>
	)
}
