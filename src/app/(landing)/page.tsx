'use client'

import { Header } from './components/header/header'
import { Hero } from './components/hero/hero'
import { SocialProof } from './components/social-proof/social-proof'
import { Problem } from './components/problem/problem'
import { Features } from './components/features/features'
import { HowItWorks } from './components/how-it-works/how-it-works'
import { FocusMode } from './components/focus-mode/focus-mode'
import { TeamCollab } from './components/team-collab/team-collab'
import { Testimonials } from './components/testimonials/testimonials'
import { Pricing } from './components/pricing/pricing'
import { FinalCTA } from './components/final-cta/final-cta'
import { Footer } from './components/footer/footer'
import classes from './page.module.scss'

export default function LandingPage() {
	return (
		<div className={classes.landing}>
			<Header />
			<main>
				<Hero />
				<SocialProof />
				<Problem />
				<Features />
				<HowItWorks />
				<FocusMode />
				<TeamCollab />
				<Testimonials />
				<Pricing />
				<FinalCTA />
			</main>
			<Footer />
		</div>
	)
}
