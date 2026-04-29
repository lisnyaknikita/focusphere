import { useEffect, useRef } from 'react'

export const useCalendarScroll = (dependencies: unknown[]) => {
	const isInitialScrollDone = useRef(false)

	useEffect(() => {
		if (isInitialScrollDone.current) return

		const scrollToTime = () => {
			const indicator = document.querySelector('.sx__current-time-indicator') as HTMLElement | null

			if (indicator) {
				let scrollParent: HTMLElement | null = null
				let parent = indicator.parentElement

				while (parent && parent !== document.body && parent !== document.documentElement) {
					const style = window.getComputedStyle(parent)
					if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') {
						scrollParent = parent
						break
					}
					parent = parent.parentElement
				}

				if (scrollParent) {
					const parentRect = scrollParent.getBoundingClientRect()
					const indicatorRect = indicator.getBoundingClientRect()
					const scrollTop = scrollParent.scrollTop + (indicatorRect.top - parentRect.top) - parentRect.height / 2
					scrollParent.scrollTo({
						top: scrollTop,
						behavior: 'smooth',
					})
				} else {
					indicator.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					})
				}
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
