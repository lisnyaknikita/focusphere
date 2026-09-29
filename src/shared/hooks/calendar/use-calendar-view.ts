'use client'

import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { useEffect, useState } from 'react'

const VIEW_KEY = 'focusphere_calendar_view'

export const useCalendarView = () => {
	const [view, setView] = useState<CalendarView>('month')

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as CalendarView
		if (saved && ['month', 'week', 'day'].includes(saved)) {
			setView(saved)
		}
	}, [])

	const handleViewChange = (nextView: CalendarView) => {
		setView(nextView)
		localStorage.setItem(VIEW_KEY, nextView)
	}

	return { view, handleViewChange }
}
