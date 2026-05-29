'use client'

import { useUser } from '@/shared/hooks/use-user/use-user'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LandingThemeProvider, useLandingTheme } from './landing-theme-context'
import { Features } from './components/features/features'
import { FinalCTA } from './components/final-cta/final-cta'
import { Footer } from './components/footer/footer'
import { Header } from './components/header/header'
import { Hero } from './components/hero/hero'
import { Problem } from './components/problem/problem'
import { TeamCollab } from './components/team-collab/team-collab'
import { Testimonials } from './components/testimonials/testimonials'
import classes from './page.module.scss'

function LandingContent() {
	const { theme } = useLandingTheme()

	return (
		<div className={clsx(classes.landing, classes[theme])}>
			<Header />
			<main>
				<Hero />
				<Problem />
				<Features />
				<TeamCollab />
				<Testimonials />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	)
}

export default function LandingPage() {
	const { user, loading } = useUser()
	const router = useRouter()

	useEffect(() => {
		if (!loading && user) {
			router.replace('/dashboard')
		}
	}, [user, loading, router])

	if (loading || user) {
		return null
	}

	return (
		<LandingThemeProvider>
			<LandingContent />
		</LandingThemeProvider>
	)
}
