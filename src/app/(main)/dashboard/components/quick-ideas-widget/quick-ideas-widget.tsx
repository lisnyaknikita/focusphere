'use client'

import { useQuickIdeas } from '@/shared/hooks/use-quick-ideas/use-quick-ideas'
import { IdeaIcon } from '@/shared/ui/icons/idea-icon'
import { motion, useAnimationControls } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './quick-ideas-widget.module.scss'

export const QuickIdeasWidget = () => {
	const router = useRouter()
	const { ideas, isLoading, isFetched } = useQuickIdeas()

	const controls = useAnimationControls()
	const isInitialized = useRef(false)
	const prevLengthRef = useRef<number | null>(null)

	useEffect(() => {
		if (!isFetched || isLoading) return

		if (!isInitialized.current) {
			isInitialized.current = true
			prevLengthRef.current = ideas.length
			return
		}

		if (prevLengthRef.current !== null && prevLengthRef.current !== ideas.length) {
			prevLengthRef.current = ideas.length
			controls.start({
				scale: [1, 0.9, 1.12, 1],
				y: [0, 4, -3, 0],
				transition: {
					duration: 0.35,
					delay: 0.2,
					ease: 'easeOut',
				},
			})
		}
	}, [ideas.length, isFetched, isLoading, controls])

	const handleOpen = () => {
		router.push('/dashboard?drawer=quick-ideas', { scroll: false })
	}

	return (
		<motion.button type='button' className={classes.widget} onClick={handleOpen} animate={controls}>
			<div className={classes.left}>
				<span className={classes.icon}>
					<IdeaIcon width={18} height={18} />
				</span>
				<span className={classes.label}>Quick Ideas Inbox</span>
			</div>
			<span className={classes.badge}>
				{isLoading ? <BeatLoader color='#aaa' size={2} className={classes.loader} /> : ideas.length}
			</span>
		</motion.button>
	)
}
