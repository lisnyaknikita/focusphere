'use client'

import { useLandingTheme } from '@/app/(landing)/landing-theme-context'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import classes from './hero.module.scss'

const fadeInUpVariants: Variants = {
	hidden: { opacity: 0, y: 15 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: [0.16, 1, 0.3, 1] as const,
		},
	},
}

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.12,
		},
	},
}

export const Hero = () => {
	const { theme } = useLandingTheme()

	return (
		<section className={classes.hero}>
			<motion.div
				className={classes.glowBg}
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
			/>

			<motion.div className={classes.container} variants={containerVariants} initial='hidden' animate='visible'>
				<motion.div variants={fadeInUpVariants} className={classes.badge}>
					100% Free Public Beta &bull; Solo-First, Team-Ready
				</motion.div>

				<motion.h1 variants={fadeInUpVariants} className={classes.title}>
					Clarity starts <span className={classes.highlight}>here.</span>
				</motion.h1>

				<motion.p variants={fadeInUpVariants} className={classes.subtitle}>
					One unified workspace to rule your day. Bring your project sprints, daily time-blocking, focus soundscapes,
					and rapid idea capture under one roof.
				</motion.p>

				<motion.div variants={fadeInUpVariants} className={classes.cta}>
					<Link href='/signup' className={classes.primaryBtn}>
						Get started — it&apos;s free
					</Link>
					<a href='#features' className={classes.secondaryBtn}>
						Explore workspace ↓
					</a>
				</motion.div>
				<motion.div
					variants={{
						hidden: { opacity: 0, y: 30, scale: 0.98 },
						visible: {
							opacity: 1,
							y: 0,
							scale: 1,
							transition: {
								duration: 1.1,
								ease: [0.16, 1, 0.3, 1],
								delay: 0.2,
							},
						},
					}}
					className={classes.imageWrapper}
				>
					<Image
						src={`/dashboard-${theme}.avif`}
						alt='Focusphere Dashboard with Quick Ideas Drawer, Daily Time-Blocks and Mini Focus Player'
						width={1200}
						height={677}
						className={classes.heroImage}
						priority
					/>
				</motion.div>
			</motion.div>
		</section>
	)
}
