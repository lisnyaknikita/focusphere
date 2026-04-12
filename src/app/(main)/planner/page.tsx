'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { useCallback, useEffect, useState } from 'react'
import 'temporal-polyfill/global'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { TimeBlockModal } from './components/header/time-block-modal/time-block-modal'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { DailyTasksModal } from './components/main/daily-tasks-modal/daily-tasks-modal'
import { PlannerInner } from './components/main/planner-inner/planner-inner'

import { mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { useTimeBlocks } from '@/shared/hooks/planner/use-timeblocks'
import { useWeeklyGoals } from '@/shared/hooks/planner/use-weekly-goals'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { BeatLoader } from 'react-spinners'
import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [isDailyTasksModalVisible, setIsDailyTasksModalVisible] = useState(false)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)

	const { calendar, eventsService, eventModal } = useCalendarApp()
	const { user } = useUser()
	const {
		timeBlocks,
		copiedTimeBlock,
		isLoading: isBlocksLoading,
		refreshTimeBlocks,
		pasteTimeBlock,
		setCopiedTimeBlock,
	} = useTimeBlocks(user!)
	const { weeklyGoals, isLoading: isGoalsLoading, refreshWeeklyGoals } = useWeeklyGoals()
	const { dailyTasksCountByDate, isLoading: isTasksLoading, refreshDailyTasksCounters } = useDailyTasksCounters()

	const isPageLoading = isBlocksLoading || isGoalsLoading || isTasksLoading

	useEffect(() => {
		if (!eventsService) return
		eventsService.set(timeBlocks.map(mapTimeBlockToScheduleX))
	}, [timeBlocks, eventsService])

	const handleTimeBlockCreated = useCallback(() => {
		setIsTimeBlockModalVisible(false)
		refreshTimeBlocks()
	}, [refreshTimeBlocks])

	const handleDayClick = useCallback(
		async (date: string) => {
			if (copiedTimeBlock) {
				await pasteTimeBlock(date)
				return
			}
			setSelectedDate(date)
			setIsDailyTasksModalVisible(true)
		},
		[copiedTimeBlock, pasteTimeBlock]
	)

	const handleTaskModalClose = useCallback(() => {
		setIsDailyTasksModalVisible(false)
		refreshDailyTasksCounters()
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
					<AddTimeBlockButton setIsModalVisible={setIsTimeBlockModalVisible} />
				</header>
				<main className={classes.planner}>
					{isPageLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<PlannerInner
							timeBlocks={timeBlocks}
							dailyTasksCountByDate={dailyTasksCountByDate}
							calendar={calendar}
							eventsService={eventsService}
							eventModal={eventModal}
							onDayClick={handleDayClick}
							onCopyEvent={setCopiedTimeBlock}
							refreshTimeBlocks={refreshTimeBlocks}
						/>
					)}
				</main>
			</div>
			<Modal isVisible={isTimeBlockModalVisible} onClose={() => setIsTimeBlockModalVisible(false)}>
				<TimeBlockModal onClose={handleTimeBlockCreated} />
			</Modal>
			<Modal isVisible={isDailyTasksModalVisible} onClose={handleTaskModalClose}>
				{selectedDate && <DailyTasksModal date={selectedDate} onClose={handleTaskModalClose} />}
			</Modal>
		</>
	)
}
