import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { useEffect, useState } from 'react'

const VIEW_KEY = 'calendarView'

export const useCalendarView = () => {
	const [view, setView] = useState<CalendarView>('week')
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const calculateLayout = () => {
			const mobile = window.innerWidth <= 768
			setIsMobile(mobile)

			const saved = localStorage.getItem(VIEW_KEY) as CalendarView
			const currentView = saved || (mobile ? 'day' : 'week')

			if (mobile && currentView === 'week') {
				setView('day')
			} else {
				setView(currentView)
			}
		}

		calculateLayout()
		window.addEventListener('resize', calculateLayout)

		return () => window.removeEventListener('resize', calculateLayout)
	}, [])

	const handleViewChange = (nextView: CalendarView) => {
		setView(nextView)
		localStorage.setItem(VIEW_KEY, nextView)
	}

	return { view, isMobile, handleViewChange }
}
