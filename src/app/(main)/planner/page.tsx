'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import 'temporal-polyfill/global'

import { useEvents } from '@/shared/hooks/events/use-events'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { useTimeBlocks } from '@/shared/hooks/planner/use-timeblocks'
import { useWeeklyGoals } from '@/shared/hooks/planner/use-weekly-goals'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { BeatLoader } from 'react-spinners'
import { CalendarToggle } from './components/header/calendar-toggle/calendar-toggle'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { PasteBanner } from './components/main/paste-banner/paste-banner'
import { PlannerCalendarSection } from './components/main/planner-calendar-section/planner-calendar-section'
import { PlannerModals } from './components/main/planner-modals/planner-modals'
import { CopyModeContext } from './copy-mode-context'
import { DailyTasksCountByDateContext } from './daily-tasks-count-context'
import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [quickCreatedEvent, setQuickCreatedEvent] = useState<SXEvent | null>(null)
	const [showCalendarEvents, setShowCalendarEvents] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false
		return localStorage.getItem('focusphere_planner_show_calendar_events') === 'true'
	})

	const hasDailyTasksChangesRef = useRef(false)
	const copiedTimeBlockRef = useRef<SXEvent | null>(null)

	const timeFormat = useSettingsStore(state => state.timeFormat)
	const { user } = useUser()
	const { events: calendarEvents } = useEvents()
	const {
		timeBlocks,
		copiedTimeBlock,
		isLoading: isBlocksLoading,
		refreshTimeBlocks,
		pasteTimeBlock,
		setCopiedTimeBlock,
		createQuickBlock,
		createQuickBlockWithRange,
	} = useTimeBlocks(user)

	useEffect(() => {
		copiedTimeBlockRef.current = copiedTimeBlock
	}, [copiedTimeBlock])

	const { weeklyGoals, isLoading: isGoalsLoading, refreshWeeklyGoals } = useWeeklyGoals()
	const { dailyTasksCountByDate, isLoading: isTasksLoading, refreshDailyTasksCounters } = useDailyTasksCounters()

	const isPageLoading = isBlocksLoading || isGoalsLoading || isTasksLoading

	const handleToggleCalendarEvents = useCallback(() => {
		setShowCalendarEvents(prev => {
			const next = !prev
			localStorage.setItem('focusphere_planner_show_calendar_events', String(next))
			return next
		})
	}, [])

	const handleDailyTasksChanged = useCallback(() => {
		hasDailyTasksChangesRef.current = true
	}, [])

	const handleTimeBlockCreated = useCallback(() => {
		setIsTimeBlockModalVisible(false)
		refreshTimeBlocks()
	}, [refreshTimeBlocks])

	const handleAddBlockClick = () => {
		setIsTimeBlockModalVisible(true)
	}

	const handleDayClick = useCallback(
		async (date: string) => {
			if (copiedTimeBlockRef.current) {
				await pasteTimeBlock(date)
				return
			}
			hasDailyTasksChangesRef.current = false
			setSelectedDate(date)
		},
		[pasteTimeBlock]
	)

	const handleTaskModalClose = useCallback(() => {
		setSelectedDate(null)
		if (hasDailyTasksChangesRef.current) {
			refreshDailyTasksCounters()
			hasDailyTasksChangesRef.current = false
		}
	}, [refreshDailyTasksCounters])

	return (
		<>
			<div className={classes.plannerPage}>
				{copiedTimeBlock && <PasteBanner copiedTimeBlock={copiedTimeBlock} onCancel={() => setCopiedTimeBlock(null)} />}
				<header className={classes.header}>
					<WeeklyGoals goals={weeklyGoals} onGoalsChange={refreshWeeklyGoals} />
					<div className={classes.headerActions}>
						<CalendarToggle showCalendarEvents={showCalendarEvents} onToggle={handleToggleCalendarEvents} />
						<AddTimeBlockButton setIsModalVisible={handleAddBlockClick} />
					</div>
				</header>
				<main className={classes.planner}>
					{isPageLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<DailyTasksCountByDateContext.Provider value={dailyTasksCountByDate}>
							<CopyModeContext.Provider value={!!copiedTimeBlock}>
								<PlannerCalendarSection
									key={timeFormat}
									timeBlocks={timeBlocks}
									calendarEvents={calendarEvents}
									showCalendarEvents={showCalendarEvents}
									onDayClick={handleDayClick}
									onCopyEvent={setCopiedTimeBlock}
									refreshTimeBlocks={refreshTimeBlocks}
									createQuickBlock={createQuickBlock}
									createQuickBlockWithRange={createQuickBlockWithRange}
									onQuickBlockCreated={setQuickCreatedEvent}
								/>
							</CopyModeContext.Provider>
						</DailyTasksCountByDateContext.Provider>
					)}
				</main>
			</div>
			<PlannerModals
				isTimeBlockOpen={isTimeBlockModalVisible}
				onTimeBlockClose={() => setIsTimeBlockModalVisible(false)}
				onTimeBlockCreated={handleTimeBlockCreated}
				selectedDate={selectedDate}
				onTaskModalClose={handleTaskModalClose}
				handleDailyTasksChanged={handleDailyTasksChanged}
				quickCreatedEvent={quickCreatedEvent}
				onQuickEventClose={setQuickCreatedEvent}
				refreshTimeBlocks={refreshTimeBlocks}
			/>
		</>
	)
}
