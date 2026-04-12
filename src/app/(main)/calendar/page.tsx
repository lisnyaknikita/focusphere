'use client'

import { Modal } from '@/shared/ui/modal/modal'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import 'temporal-polyfill/global'
import { Tabs } from '../../../shared/tabs/tabs'
import { EventModal } from './components/event-modal/event-modal'
import { CalendarInner } from './components/main/calendar/calendar'

import { useEvents } from '@/shared/hooks/events/use-events'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarView } from './constants/calendar.constants'
import classes from './page.module.scss'

const VIEW_KEY = 'calendarView'

export default function Calendar() {
	const queryClient = useQueryClient()

	const [view, setView] = useState<CalendarView>(() => {
		if (typeof window !== 'undefined') {
			return (localStorage.getItem(VIEW_KEY) as CalendarView) || 'week'
		}
		return 'week'
	})
	const [isModalVisible, setIsModalVisible] = useState(false)
	const { data: events = [], isLoading } = useEvents()

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as CalendarView | null
		if (saved) setView(saved)
	}, [])

	useEffect(() => {
		localStorage.setItem(VIEW_KEY, view)
	}, [view])

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ['events'] })
		setIsModalVisible(false)
	}

	return (
		<>
			<div className={classes.calendarPage}>
				{isLoading ? (
					<BeatLoader color='#aaa' size={10} className={classes.loader} />
				) : (
					<>
						<header className={classes.header}>
							<Tabs tabs={['month', 'week', 'day']} activeTab={view} onChange={setView} />
							<CreateButton setIsModalVisible={setIsModalVisible} text='Add event' />
						</header>
						<main className={classes.calendar}>
							<CalendarInner events={events} view={view} />
						</main>
					</>
				)}
			</div>
			<Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
				<EventModal onClose={handleRefresh} />
			</Modal>
		</>
	)
}
