'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Audiowide } from 'next/font/google'
import clsx from 'clsx'
import LogoIcon from '@/shared/ui/sidebar/components/logo/components/logo-icon/logo-icon'
import classes from './header.module.scss'

const audioWide = Audiowide({
	subsets: ['latin'],
	weight: '400',
})

const navLinks = [
	{ label: 'Features', href: '#features' },
	{ label: 'How it Works', href: '#how-it-works' },
	{ label: 'Testimonials', href: '#testimonials' },
]

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header className={classes.header}>
			<div className={classes.container}>
				<Link href="/" className={classes.logo}>
					<LogoIcon />
					<span className={audioWide.className}>focusphere</span>
				</Link>

				<nav className={classes.nav}>
					{navLinks.map((link) => (
						<a key={link.href} href={link.href} className={classes.navLink}>
							{link.label}
						</a>
					))}
				</nav>

				<div className={classes.actions}>
					<Link href="/login" className={classes.loginBtn}>
						Log in
					</Link>
					<Link href="/signup" className={classes.signupBtn}>
						Get Started
					</Link>
				</div>

				<button
					className={classes.mobileMenuBtn}
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					<span className={clsx(classes.hamburger, mobileMenuOpen && classes.open)} />
				</button>
			</div>

			{mobileMenuOpen && (
				<div className={classes.mobileMenu}>
					<nav className={classes.mobileNav}>
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className={classes.mobileNavLink}
								onClick={() => setMobileMenuOpen(false)}
							>
								{link.label}
							</a>
						))}
					</nav>
					<div className={classes.mobileActions}>
						<Link href="/login" className={classes.loginBtn}>
							Log in
						</Link>
						<Link href="/signup" className={classes.signupBtn}>
							Get Started
						</Link>
					</div>
				</div>
			)}
		</header>
	)
}
