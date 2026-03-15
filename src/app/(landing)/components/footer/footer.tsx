'use client'

import Link from 'next/link'
import { Audiowide } from 'next/font/google'
import LogoIcon from '@/shared/ui/sidebar/components/logo/components/logo-icon/logo-icon'
import classes from './footer.module.scss'

const audioWide = Audiowide({
	subsets: ['latin'],
	weight: '400',
})

const footerLinks = {
	product: [
		{ label: 'Features', href: '#features' },
		{ label: 'How it works', href: '#how-it-works' },
		{ label: 'Pricing', href: '#' },
		{ label: 'Changelog', href: '#' },
	],
	resources: [
		{ label: 'Documentation', href: '#' },
		{ label: 'Help Center', href: '#' },
		{ label: 'Blog', href: '#' },
		{ label: 'API', href: '#' },
	],
	company: [
		{ label: 'About', href: '#' },
		{ label: 'Careers', href: '#' },
		{ label: 'Contact', href: '#' },
	],
}

export const Footer = () => {
	return (
		<footer className={classes.footer}>
			<div className={classes.container}>
				<div className={classes.top}>
					<div className={classes.brand}>
						<Link href="/" className={classes.logo}>
							<LogoIcon />
							<span className={audioWide.className}>focusphere</span>
						</Link>
						<p className={classes.tagline}>
							All-in-one productivity platform for focused work.
						</p>
					</div>

					<div className={classes.links}>
						<div className={classes.linkGroup}>
							<h4 className={classes.linkGroupTitle}>Product</h4>
							<ul className={classes.linkList}>
								{footerLinks.product.map((link) => (
									<li key={link.label}>
										<a href={link.href} className={classes.link}>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div className={classes.linkGroup}>
							<h4 className={classes.linkGroupTitle}>Resources</h4>
							<ul className={classes.linkList}>
								{footerLinks.resources.map((link) => (
									<li key={link.label}>
										<a href={link.href} className={classes.link}>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div className={classes.linkGroup}>
							<h4 className={classes.linkGroupTitle}>Company</h4>
							<ul className={classes.linkList}>
								{footerLinks.company.map((link) => (
									<li key={link.label}>
										<a href={link.href} className={classes.link}>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className={classes.bottom}>
					<p className={classes.copyright}>
						2024 Focusphere. All rights reserved.
					</p>
					<div className={classes.legal}>
						<a href="#" className={classes.legalLink}>Privacy Policy</a>
						<a href="#" className={classes.legalLink}>Terms of Service</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
