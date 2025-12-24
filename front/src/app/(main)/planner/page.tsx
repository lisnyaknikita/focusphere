'use client'

import { db } from '@/lib/appwrite'
import { TimeBlock } from '@/shared/types/time-block'
import { Modal } from '@/shared/ui/modal/modal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useEffect, useState } from 'react'
import 'temporal-polyfill/global'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { TimeBlockModal } from './components/header/time-block-modal/time-block-modal'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { DailyTasksModal } from './components/main/daily-tasks-modal/daily-tasks-modal'
import { PlannerInner } from './components/main/planner-inner/planner-inner'

import { mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { DailyTask } from '@/shared/types/daily-task'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { BeatLoader } from 'react-spinners'
import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [isDailyTasksModalVisible, setIsDailyTasksModalVisible] = useState(false)
	const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([])
	const [dailyTasksCountByDate, setDailyTasksCountByDate] = useState<Record<string, number>>({})
	const [isLoading, setIsLoading] = useState(true)

	const { calendar, eventsService, eventModal } = useCalendarApp()

	useEffect(() => {
		if (!eventsService) return
		eventsService.set(timeBlocks.map(mapTimeBlockToScheduleX))
	}, [timeBlocks, eventsService])

	useEffect(() => {
		const fetchData = async () => {
			try {
				await Promise.all([getTimeBlocks(), getWeeklyGoals(), getDailyTasksCounters()])
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [])

	const getTimeBlocks = async () => {
		const userId = await getCurrentUserId()

		const filters = [Query.equal('userId', userId)]

		try {
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
				queries: filters,
			})

			const typedTimeBlocks = response.rows as unknown as TimeBlock[]

			setTimeBlocks(typedTimeBlocks)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
		}
	}

	const handleTimeBlockCreated = () => {
		setIsTimeBlockModalVisible(false)
		getTimeBlocks()
	}

	const getWeeklyGoals = async () => {
		const userId = await getCurrentUserId()

		const queries = [Query.equal('userId', userId), Query.orderAsc('index')]

		try {
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
				queries,
			})

			const typedWeeklyGoals = response.rows as unknown as WeeklyGoal[]

			setWeeklyGoals(typedWeeklyGoals)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
		}
	}

	const getDailyTasksCounters = async () => {
		const userId = await getCurrentUserId()

		const queries = [Query.equal('userId', userId), Query.equal('isCompleted', false)]

		const response = await db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
			queries,
		})

		const map: Record<string, number> = {}

		for (const row of response.rows as unknown as DailyTask[]) {
			map[row.date] = (map[row.date] ?? 0) + 1
		}

		setDailyTasksCountByDate(map)
	}

	return (
		<>
			<div className={classes.plannerPage}>
				<header className={classes.header}>
					<WeeklyGoals goals={weeklyGoals} onGoalsChange={getWeeklyGoals} />
					<AddTimeBlockButton setIsModalVisible={setIsTimeBlockModalVisible} />
				</header>
				<main className={classes.planner}>
					{isLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<PlannerInner
							timeBlocks={timeBlocks}
							dailyTasksCountByDate={dailyTasksCountByDate}
							calendar={calendar}
							eventsService={eventsService}
							eventModal={eventModal}
							onDayClick={(date: string) => {
								setSelectedDate(date)
								setIsDailyTasksModalVisible(true)
							}}
						/>
					)}
				</main>
			</div>
			<Modal isVisible={isTimeBlockModalVisible} onClose={() => setIsTimeBlockModalVisible(false)}>
				<TimeBlockModal onClose={handleTimeBlockCreated} />
			</Modal>
			<Modal
				isVisible={isDailyTasksModalVisible}
				onClose={() => {
					setIsDailyTasksModalVisible(false)
					getDailyTasksCounters()
				}}
			>
				{selectedDate && <DailyTasksModal date={selectedDate} onClose={() => setIsDailyTasksModalVisible(false)} />}
			</Modal>
		</>
	)
}
