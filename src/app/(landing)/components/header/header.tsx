import { Logo } from '@/shared/ui/sidebar/components/logo/logo'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import classes from './header.module.scss'

const navLinks = [
	{ label: 'Problems', href: '#problems' },
	{ label: 'Features', href: '#features' },
	{ label: 'Testimonials', href: '#testimonials' },
]

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header className={classes.header}>
			<div className={classes.container}>
				<Logo />
				<nav className={classes.nav}>
					{navLinks.map(link => (
						<a key={link.href} href={link.href} className={classes.navLink}>
							{link.label}
						</a>
					))}
				</nav>
				<div className={classes.actions}>
					<Link href='/login' className={classes.loginBtn}>
						Log in
					</Link>
					<Link href='/signup' className={classes.signupBtn}>
						Get Started
					</Link>
				</div>
				<button
					className={classes.mobileMenuBtn}
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label='Toggle menu'
				>
					<span className={clsx(classes.hamburger, mobileMenuOpen && classes.open)} />
				</button>
			</div>
			{mobileMenuOpen && (
				<div className={classes.mobileMenu}>
					<nav className={classes.mobileNav}>
						{navLinks.map(link => (
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
						<Link href='/login' className={classes.loginBtn}>
							Log in
						</Link>
						<Link href='/signup' className={classes.signupBtn}>
							Get Started
						</Link>
					</div>
				</div>
			)}
		</header>
	)
}
