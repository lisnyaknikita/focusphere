'use client'

import { createTimeBlock, deleteTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { useCallback, useEffect, useRef, useState } from 'react'
import 'temporal-polyfill/global'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { TimeBlockModal } from './components/header/time-block-modal/time-block-modal'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { DailyTasksModal } from './components/main/daily-tasks-modal/daily-tasks-modal'
import { PlannerInner } from './components/main/planner-inner/planner-inner'

import { mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { useTimeBlocks } from '@/shared/hooks/planner/use-timeblocks'
import { useWeeklyGoals } from '@/shared/hooks/planner/use-weekly-goals'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { BeatLoader } from 'react-spinners'
import { CopyModeContext } from './copy-mode-context'
import { DailyTasksCountByDateContext } from './daily-tasks-count-context'
import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [isDailyTasksModalVisible, setIsDailyTasksModalVisible] = useState(false)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [quickCreatedEvent, setQuickCreatedEvent] = useState<import('@schedule-x/calendar').CalendarEvent | null>(null)
	const copiedTimeBlockRef = useRef<SXEvent | null>(null)
	const hasDailyTasksChangesRef = useRef(false)
	const isCopyModeRef = useRef(false)

	const { user } = useUser()
	const { isPro, openPaywall } = useBilling()
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

	const { calendar, eventsService, eventModal } = useCalendarApp({
		onQuickCreate: async dateTime => {
			if (!isProRef.current && timeBlocksRef.current.length >= 50) {
				openPaywallRef.current('planner_blocks_unlimited')
				return
			}
			const event = await createQuickBlock(dateTime)
			if (event) setQuickCreatedEvent(event)
		},
	})
	const { weeklyGoals, isLoading: isGoalsLoading, refreshWeeklyGoals } = useWeeklyGoals()
	const { dailyTasksCountByDate, isLoading: isTasksLoading, refreshDailyTasksCounters } = useDailyTasksCounters()

	const isPageLoading = isBlocksLoading || isGoalsLoading || isTasksLoading

	useEffect(() => {
		copiedTimeBlockRef.current = copiedTimeBlock
	}, [copiedTimeBlock])

	const handleDailyTasksChanged = useCallback(() => {
		hasDailyTasksChangesRef.current = true
	}, [])

	useEffect(() => {
		if (!eventsService) return
		eventsService.set(timeBlocks.map(mapTimeBlockToScheduleX))
	}, [timeBlocks, eventsService])

	useEffect(() => {
		isCopyModeRef.current = !!copiedTimeBlock
	}, [copiedTimeBlock])

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
			setIsDailyTasksModalVisible(true)
		},
		[pasteTimeBlock]
	)

	const handleTaskModalClose = useCallback(() => {
		setIsDailyTasksModalVisible(false)
		if (hasDailyTasksChangesRef.current) {
			refreshDailyTasksCounters()
			hasDailyTasksChangesRef.current = false
		}
	}, [refreshDailyTasksCounters])

	return (
		<>
			<div className={classes.plannerPage}>
				{copiedTimeBlock && (
					<div className={classes.pasteBanner}>
						<div className={classes.info}>
							<span className={classes.label}>Copying:</span>
							<strong className={classes.eventTitle}>{copiedTimeBlock.title}</strong>
						</div>
						<p className={classes.hint}>Click on any day in the calendar to paste</p>
						<button onClick={() => setCopiedTimeBlock(null)} className={classes.cancelBtn}>
							Cancel
						</button>
					</div>
				)}
				<header className={classes.header}>
					<WeeklyGoals goals={weeklyGoals} onGoalsChange={refreshWeeklyGoals} />
					<AddTimeBlockButton setIsModalVisible={handleAddBlockClick} />
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
			<Modal isVisible={isTimeBlockModalVisible} onClose={() => setIsTimeBlockModalVisible(false)}>
				<TimeBlockModal onClose={handleTimeBlockCreated} />
			</Modal>
			<Modal isVisible={isDailyTasksModalVisible} onClose={handleTaskModalClose}>
				{selectedDate && (
					<DailyTasksModal
						date={selectedDate}
						onClose={handleTaskModalClose}
						onTasksChanged={handleDailyTasksChanged}
					/>
				)}
			</Modal>
			<Modal
				isVisible={!!quickCreatedEvent}
				onClose={async () => {
					if (quickCreatedEvent) {
						await deleteTimeBlock(String(quickCreatedEvent.id))
					}
					setQuickCreatedEvent(null)
					refreshTimeBlocks()
				}}
				className='forQuickTimeBlock'
			>
				{quickCreatedEvent && (
					<EventInfoModal
						event={quickCreatedEvent}
						isTimeBlock
						initialEditing
						onUpdated={() => {
							setQuickCreatedEvent(null)
							refreshTimeBlocks()
						}}
						onCancelCreate={async () => {
							await deleteTimeBlock(String(quickCreatedEvent.id))
							setQuickCreatedEvent(null)
							refreshTimeBlocks()
						}}
						onConfirmDelete={async id => {
							await deleteTimeBlock(id)
							setQuickCreatedEvent(null)
							refreshTimeBlocks()
						}}
						actions={{
							create: createTimeBlock,
							update: updateTimeBlock,
						}}
					/>
				)}
			</Modal>
		</>
	)
}
