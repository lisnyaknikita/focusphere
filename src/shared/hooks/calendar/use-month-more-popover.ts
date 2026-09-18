import { useEffect, useState } from 'react'

export const useMonthMorePopover = (wrapperRef: React.RefObject<HTMLDivElement | null>) => {
	const [popoverState, setPopoverState] = useState<{
		dateStr: string
		anchorEl: HTMLElement
	} | null>(null)

	useEffect(() => {
		const el = wrapperRef.current
		if (!el) return

		const handleNativeClickCapture = (e: MouseEvent) => {
			const target = e.target as HTMLElement
			const moreBtn = target.closest(
				'.sx__month-grid-day__events-more, .sx__month-grid-day__more-events-button'
			) as HTMLElement | null

			if (moreBtn) {
				e.preventDefault()
				e.stopPropagation()
				e.stopImmediatePropagation()

				const dayCell = moreBtn.closest('[data-date]')
				const dateStr = dayCell?.getAttribute('data-date')

				if (dateStr) {
					setPopoverState({ dateStr, anchorEl: moreBtn })
				}
			}
		}

		el.addEventListener('click', handleNativeClickCapture, true)
		return () => {
			el.removeEventListener('click', handleNativeClickCapture, true)
		}
	}, [wrapperRef])

	return {
		popoverState,
		closePopover: () => setPopoverState(null),
	}
}
