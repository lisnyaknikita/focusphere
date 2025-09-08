'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { EventModal } from './components/event-modal/event-modal'
import { CreateButton } from './components/header/create-button/create-button'
import { Tabs } from './components/header/tabs/tabs'
import { CalendarInner } from './components/main/calendar/calendar'
import classes from './page.module.scss'

export type CalendarView = 'month' | 'week' | 'day'

const VIEW_KEY = 'calendarView'

export default function Calendar() {
	const [view, setView] = useState<CalendarView | null>(null)
	const [isModalVisible, setIsModalVisible] = useState(false)

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as CalendarView | null
		if (saved) setView(saved || 'week')
	}, [])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	return (
		<>
			<div className={classes.calendarPage}>
				{!view ? (
					<BeatLoader color='#aaa' size={10} className={classes.loader} />
				) : (
					<>
						<header className={classes.header}>
							<Tabs activeTab={view} onChange={setView} />
							<CreateButton setIsModalVisible={setIsModalVisible} />
						</header>
						<main className={classes.calendar}>
							<CalendarInner view={view} />
						</main>
					</>
				)}
			</div>
			<Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
				<EventModal onClose={() => setIsModalVisible(false)} />
			</Modal>
		</>
	)
}
