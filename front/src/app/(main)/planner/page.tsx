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

import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [isDailyTasksModalVisible, setIsDailyTasksModalVisible] = useState(false)
	const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])

	useEffect(() => {
		getTimeBlocks()
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

	return (
		<>
			<div className={classes.plannerPage}>
				<header className={classes.header}>
					<WeeklyGoals />
					<AddTimeBlockButton setIsModalVisible={setIsTimeBlockModalVisible} />
				</header>
				<main className={classes.planner}>
					<PlannerInner timeBlocks={timeBlocks} onDailyTasksModalVisible={setIsDailyTasksModalVisible} />
				</main>
			</div>
			<Modal isVisible={isTimeBlockModalVisible} onClose={() => setIsTimeBlockModalVisible(false)}>
				<TimeBlockModal onClose={handleTimeBlockCreated} />
			</Modal>
			<Modal isVisible={isDailyTasksModalVisible} onClose={() => setIsDailyTasksModalVisible(false)}>
				<DailyTasksModal onClose={() => setIsDailyTasksModalVisible(false)} />
			</Modal>
		</>
	)
}
