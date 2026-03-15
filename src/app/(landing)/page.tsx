'use client'

import { Header } from './components/header/header'
import { Hero } from './components/hero/hero'
import { Features } from './components/features/features'
import { HowItWorks } from './components/how-it-works/how-it-works'
import { Testimonials } from './components/testimonials/testimonials'
import { FinalCTA } from './components/final-cta/final-cta'
import { Footer } from './components/footer/footer'
import classes from './page.module.scss'

export default function LandingPage() {
	return (
		<div className={classes.landing}>
			<Header />
			<main>
				<Hero />
				<Features />
				<HowItWorks />
				<Testimonials />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	)
}
