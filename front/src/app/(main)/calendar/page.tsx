'use client'

import { db } from '@/lib/appwrite'
import { CalendarEvent } from '@/shared/types/event'
import { Modal } from '@/shared/ui/modal/modal'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import 'temporal-polyfill/global'
import { Tabs } from '../../../shared/tabs/tabs'
import { EventModal } from './components/event-modal/event-modal'
import { CreateButton } from './components/header/create-button/create-button'
import { CalendarInner } from './components/main/calendar/calendar'

import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import classes from './page.module.scss'

export type CalendarView = 'month' | 'week' | 'day'

const VIEW_KEY = 'calendarView'

export default function Calendar() {
	const [view, setView] = useState<CalendarView | null>('week')
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [events, setEvents] = useState<CalendarEvent[]>([])

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as CalendarView | null
		setView(saved ?? 'week')
	}, [])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	useEffect(() => {
		getEvents()
	}, [])

	const getEvents = async () => {
		const userId = await getCurrentUserId()

		const filters = [Query.equal('userId', userId)]

		try {
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
				queries: filters,
			})

			const typedEvents = response.rows as unknown as CalendarEvent[]

			setEvents(typedEvents)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
		}
	}

	const handleEventCreated = () => {
		setIsModalVisible(false)
		getEvents()
	}

	return (
		<>
			<div className={classes.calendarPage}>
				{!view ? (
					<BeatLoader color='#aaa' size={10} className={classes.loader} />
				) : (
					<>
						<header className={classes.header}>
							<Tabs tabs={['month', 'week', 'day']} activeTab={view} onChange={setView} />
							<CreateButton setIsModalVisible={setIsModalVisible} />
						</header>
						<main className={classes.calendar}>
							<CalendarInner events={events} />
						</main>
					</>
				)}
			</div>
			<Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
				<EventModal onClose={handleEventCreated} />
			</Modal>
		</>
	)
}
