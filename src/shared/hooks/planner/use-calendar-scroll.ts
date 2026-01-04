import { useEffect, useRef } from 'react'

export const useCalendarScroll = (dependencies: unknown[]) => {
	const isInitialScrollDone = useRef(false)

	useEffect(() => {
		if (isInitialScrollDone.current) return

		const scrollToTime = () => {
			const indicator = document.querySelector('.sx__current-time-indicator')

			if (indicator) {
				indicator.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
				isInitialScrollDone.current = true
			}
		}

		const timeout = setTimeout(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					scrollToTime()
				})
			})
		}, 300)

		return () => clearTimeout(timeout)
	}, [dependencies])
}
