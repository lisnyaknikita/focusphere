import { createTimeBlock, deleteTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { TimeBlockModal } from '../../header/time-block-modal/time-block-modal'
import { DailyTasksModal } from '../daily-tasks-modal/daily-tasks-modal'

interface PlannerModalsProps {
	isTimeBlockOpen: boolean
	onTimeBlockClose: () => void
	onTimeBlockCreated: () => void
	selectedDate: string | null
	onTaskModalClose: () => void
	handleDailyTasksChanged: () => void
	quickCreatedEvent: SXEvent | null
	onQuickEventClose: (event: SXEvent | null) => void
	refreshTimeBlocks: () => void
}

export const PlannerModals = ({
	isTimeBlockOpen,
	onTimeBlockClose,
	onTimeBlockCreated,
	selectedDate,
	onTaskModalClose,
	handleDailyTasksChanged,
	quickCreatedEvent,
	onQuickEventClose,
	refreshTimeBlocks,
}: PlannerModalsProps) => {
	return (
		<>
			<Modal isVisible={isTimeBlockOpen} onClose={onTimeBlockClose}>
				<TimeBlockModal onClose={onTimeBlockCreated} />
			</Modal>

			<Modal isVisible={!!selectedDate} onClose={onTaskModalClose}>
				{selectedDate && (
					<DailyTasksModal date={selectedDate} onClose={onTaskModalClose} onTasksChanged={handleDailyTasksChanged} />
				)}
			</Modal>

			<Modal
				isVisible={!!quickCreatedEvent}
				onClose={async () => {
					if (quickCreatedEvent) await deleteTimeBlock(String(quickCreatedEvent.id))
					onQuickEventClose(null)
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
							onQuickEventClose(null)
							refreshTimeBlocks()
						}}
						onCancelCreate={async () => {
							await deleteTimeBlock(String(quickCreatedEvent.id))
							onQuickEventClose(null)
							refreshTimeBlocks()
						}}
						onConfirmDelete={async id => {
							await deleteTimeBlock(id)
							onQuickEventClose(null)
							refreshTimeBlocks()
						}}
						actions={{ create: createTimeBlock, update: updateTimeBlock }}
					/>
				)}
			</Modal>
		</>
	)
}
