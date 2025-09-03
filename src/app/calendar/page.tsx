'use client'

import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { CreateButton } from './components/header/create-button/create-button'
import { Tabs } from './components/header/tabs/tabs'
import { CalendarInner } from './components/main/calendar/calendar'
import classes from './page.module.scss'

export type CalendarView = 'month' | 'week' | 'day' | null

const VIEW_KEY = 'calendarView'

export default function Calendar() {
	const [view, setView] = useState<CalendarView | null>(null)

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as CalendarView | null
		if (saved) setView(saved || 'week')
	}, [])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	return (
		<div className={classes.calendarPage}>
			<header className={classes.header}>
				<Tabs activeTab={view} onChange={setView} />
				<CreateButton />
			</header>
			<main className={classes.calendar}>
				{!view ? <BeatLoader color='#aaa' size={10} className={classes.loader} /> : <CalendarInner view={view} />}
			</main>
		</div>
	)
}
