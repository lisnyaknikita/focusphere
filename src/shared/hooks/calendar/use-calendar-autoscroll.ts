import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { useEffect } from 'react'

export const useCalendarAutoscroll = (view: CalendarView) => {
	useEffect(() => {
		if (view === 'month') return

		const timeout = setTimeout(() => {
			const el = document.querySelector('.sx__current-time-indicator') as HTMLElement | null
			if (!el) return

			let scrollParent: HTMLElement | null = null
			let parent = el.parentElement

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
				const indicatorRect = el.getBoundingClientRect()
				const scrollTop = scrollParent.scrollTop + (indicatorRect.top - parentRect.top) - parentRect.height / 2
				scrollParent.scrollTo({
					top: scrollTop,
					behavior: 'smooth',
				})
			} else {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, 100)

		return () => clearTimeout(timeout)
	}, [view])
}
