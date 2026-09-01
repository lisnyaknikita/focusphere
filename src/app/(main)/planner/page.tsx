'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import 'temporal-polyfill/global'

import { mapEventToScheduleX, mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useEvents } from '@/shared/hooks/events/use-events'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { usePlannerCalendar } from '@/shared/hooks/planner/use-planner-calendar'
import { useTimeBlocks } from '@/shared/hooks/planner/use-timeblocks'
import { useWeeklyGoals } from '@/shared/hooks/planner/use-weekly-goals'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { BeatLoader } from 'react-spinners'
import { CalendarToggle } from './components/header/calendar-toggle/calendar-toggle'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { PasteBanner } from './components/main/paste-banner/paste-banner'
import { PlannerInner } from './components/main/planner-inner/planner-inner'
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

	const { user } = useUser()
	const { isPro, openPaywall } = useBilling()
	const { events: calendarEvents } = useEvents()
	const {
		timeBlocks,
		copiedTimeBlock,
		isLoading: isBlocksLoading,
		refreshTimeBlocks,
		pasteTimeBlock,
		setCopiedTimeBlock,
		createQuickBlock,
	} = useTimeBlocks(user)

	const isProRef = useRef(isPro)
	const timeBlocksRef = useRef(timeBlocks)
	const openPaywallRef = useRef(openPaywall)

	useEffect(() => {
		isProRef.current = isPro
		timeBlocksRef.current = timeBlocks
		openPaywallRef.current = openPaywall
	}, [isPro, timeBlocks, openPaywall])

	const { calendar, eventsService, eventModal } = usePlannerCalendar({
		isPro,
		timeBlocks,
		openPaywall,
		createQuickBlock,
		onQuickBlockCreated: setQuickCreatedEvent,
	})

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

	useEffect(() => {
		copiedTimeBlockRef.current = copiedTimeBlock
	}, [copiedTimeBlock])

	const handleDailyTasksChanged = useCallback(() => {
		hasDailyTasksChangesRef.current = true
	}, [])

	useEffect(() => {
		if (!eventsService) return
		const mappedBlocks = timeBlocks.map(mapTimeBlockToScheduleX)
		const mappedCalendarEvents = showCalendarEvents ? calendarEvents.map(mapEventToScheduleX) : []
		eventsService.set([...mappedBlocks, ...mappedCalendarEvents])
	}, [timeBlocks, calendarEvents, showCalendarEvents, eventsService])

	const handleTimeBlockCreated = useCallback(() => {
		setIsTimeBlockModalVisible(false)
		refreshTimeBlocks()
	}, [refreshTimeBlocks])

	const handleAddBlockClick = () => {
		if (!isPro && timeBlocks.length >= 50) {
			openPaywall('planner_blocks_unlimited')
			return
		}
		setIsTimeBlockModalVisible(true)
	}

	const handleDayClick = useCallback(
		async (date: string) => {
			if (copiedTimeBlockRef.current) {
				if (!isProRef.current && timeBlocksRef.current.length >= 50) {
					openPaywallRef.current('planner_blocks_unlimited')
					return
				}
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
								<PlannerInner
									timeBlocks={timeBlocks}
									calendar={calendar}
									eventsService={eventsService}
									eventModal={eventModal}
									onDayClick={handleDayClick}
									onCopyEvent={setCopiedTimeBlock}
									refreshTimeBlocks={refreshTimeBlocks}
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
