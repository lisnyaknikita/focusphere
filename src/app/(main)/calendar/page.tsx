'use client'

import { useCalendarView } from '@/shared/hooks/calendar/use-calendar-view'
import { InitialEventValues } from '@/shared/hooks/calendar/use-event-form'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { useCalendarOperationStore } from '@/shared/stores/calendar-operation.store'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { Modal } from '@/shared/ui/modal/modal'
import { Tabs } from '@/shared/ui/tabs/tabs'
import '@schedule-x/theme-default/dist/index.css'
import { useState } from 'react'
import 'temporal-polyfill/global'
import { EventModal } from './components/event-modal/event-modal'
import { CalendarInner } from './components/main/calendar/calendar'
import { DailyTasksModal } from './components/main/calendar/components/daily-tasks-modal/daily-tasks-modal'
import classes from './page.module.scss'

export default function Calendar() {
	const [initialValues, setInitialValues] = useState<InitialEventValues | null>(null)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)

	const timeFormat = useSettingsStore(state => state.timeFormat)
	const operation = useCalendarOperationStore(state => state.operation)
	const { view, handleViewChange } = useCalendarView()

	const handleEventCreated = () => {
		setInitialValues(null)
	}

	return (
		<>
			<div className={classes.calendarPage}>
				<>
					<header className={classes.header}>
						<div className={classes.headerLeft}>
							<Tabs tabs={['month', 'week', 'day']} activeTab={view} onChange={handleViewChange} />
							{operation ? (
								<span className={classes.syncingIndicator} role='status'>
									<span className={classes.syncingDot} />
									{operation.label}
								</span>
							) : isGoogleLoading ? (
								<span className={classes.syncingIndicator}>
									<span className={classes.syncingDot} />
									Syncing Google Calendar...
								</span>
							) : null}
						</div>
						<CreateButton setIsModalVisible={() => setInitialValues({})} text='Add event' disabled={Boolean(operation)} />
					</header>
					<main className={classes.calendar}>
						<CalendarInner
							key={`${view}-${timeFormat}`}
							view={view}
							onRequestCreate={setInitialValues}
							onDayClick={setSelectedDate}
							onGoogleLoadingChange={setIsGoogleLoading}
						/>
					</main>
				</>
			</div>
			<Modal isVisible={initialValues !== null} onClose={() => setInitialValues(null)}>
				<EventModal
					onClose={() => setInitialValues(null)}
					onSuccess={handleEventCreated}
					initialValues={initialValues || undefined}
				/>
			</Modal>
			<Modal isVisible={selectedDate !== null} onClose={() => setSelectedDate(null)}>
				{selectedDate && (
					<DailyTasksModal date={selectedDate} onClose={() => setSelectedDate(null)} onTasksChanged={() => undefined} />
				)}
			</Modal>
		</>
	)
}
