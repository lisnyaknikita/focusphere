'use client'

import { useLandingTheme } from '@/app/(landing)/landing-theme-context'
import { MoonIcon } from '@/shared/ui/icons/landing/moon-icon'
import { SunIcon } from '@/shared/ui/icons/landing/sun-icon'
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
	const { theme, toggleTheme } = useLandingTheme()

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
					<button
						className={classes.themeToggle}
						onClick={toggleTheme}
						aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
					>
						<span className={clsx(classes.themeIcon, classes.sunIcon, theme === 'light' && classes.themeIconActive)}>
							<SunIcon />
						</span>
						<span className={clsx(classes.themeIcon, classes.moonIcon, theme === 'dark' && classes.themeIconActive)}>
							<MoonIcon />
						</span>
					</button>
					<Link href='/login' className={classes.loginBtn}>
						Log in
					</Link>
					<Link href='/signup' className={classes.signupBtn}>
						Get Started
					</Link>
				</div>
				<div className={classes.mobileRight}>
					<button
						className={classes.themeToggle}
						onClick={toggleTheme}
						aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
					>
						<span className={clsx(classes.themeIcon, classes.sunIcon, theme === 'light' && classes.themeIconActive)}>
							<SunIcon />
						</span>
						<span className={clsx(classes.themeIcon, classes.moonIcon, theme === 'dark' && classes.themeIconActive)}>
							<MoonIcon />
						</span>
					</button>
					<button
						className={classes.mobileMenuBtn}
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label='Toggle menu'
					>
						<span className={clsx(classes.hamburger, mobileMenuOpen && classes.open)} />
					</button>
				</div>
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
