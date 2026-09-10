import { InitialTimeBlockValues } from '@/shared/hooks/planner/use-timeblock-form'
import { Modal } from '@/shared/ui/modal/modal'
import { TimeBlockModal } from '../../header/time-block-modal/time-block-modal'
import { DailyTasksModal } from '../daily-tasks-modal/daily-tasks-modal'

interface PlannerModalsProps {
	isTimeBlockOpen: boolean
	timeBlockModalInitialValues?: InitialTimeBlockValues | null
	onTimeBlockClose: () => void
	onTimeBlockCreated: () => void
	selectedDate: string | null
	onTaskModalClose: () => void
	handleDailyTasksChanged: () => void
}

export const PlannerModals = ({
	isTimeBlockOpen,
	timeBlockModalInitialValues,
	onTimeBlockClose,
	onTimeBlockCreated,
	selectedDate,
	onTaskModalClose,
	handleDailyTasksChanged,
}: PlannerModalsProps) => {
	return (
		<>
			<Modal isVisible={isTimeBlockOpen} onClose={onTimeBlockClose}>
				<TimeBlockModal onClose={onTimeBlockCreated} initialValues={timeBlockModalInitialValues || undefined} />
			</Modal>

			<Modal isVisible={!!selectedDate} onClose={onTaskModalClose}>
				{selectedDate && (
					<DailyTasksModal date={selectedDate} onClose={onTaskModalClose} onTasksChanged={handleDailyTasksChanged} />
				)}
			</Modal>
		</>
	)
}
