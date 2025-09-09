'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { WeekView } from '../calendar/components/main/calendar/views/week/week'
import { AddTimeBlockButton } from './components/header/create-button/create-button'
import { TimeBlockModal } from './components/header/time-block-modal/time-block-modal'
import { WeeklyGoals } from './components/header/weekly-goals/weekly-goals'
import { DailyTasksModal } from './components/main/daily-tasks-modal/daily-tasks-modal'
import classes from './page.module.scss'

export default function Planner() {
	const [isTimeBlockModalVisible, setIsTimeBlockModalVisible] = useState(false)
	const [isDailyTasksModalVisible, setIsDailyTasksModalVisible] = useState(false)

	return (
		<>
			<div className={classes.plannerPage}>
				<header className={classes.header}>
					<WeeklyGoals />
					<AddTimeBlockButton setIsModalVisible={setIsTimeBlockModalVisible} />
				</header>
				<main className={classes.planner}>
					<WeekView isInPlanner={true} setIsDailyTasksModalVisible={setIsDailyTasksModalVisible} />
				</main>
			</div>
			<Modal isVisible={isTimeBlockModalVisible} onClose={() => setIsTimeBlockModalVisible(false)}>
				<TimeBlockModal onClose={() => setIsTimeBlockModalVisible(false)} />
			</Modal>
			<Modal isVisible={isDailyTasksModalVisible} onClose={() => setIsDailyTasksModalVisible(false)}>
				<DailyTasksModal onClose={() => setIsDailyTasksModalVisible(false)} />
			</Modal>
		</>
	)
}
