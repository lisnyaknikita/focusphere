'use client'

import { KanbanTask } from '@/shared/types/kanban-task'
import { Sprint } from '@/shared/types/sprint'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { Dispatch, SetStateAction } from 'react'
import { CreateSprintModal } from '../../../components/sprint-modals/create-sprint-modal/create-sprint-modal'
import { EditSprintModal } from '../../../components/sprint-modals/edit-sprint-modal/edit-sprint-modal'

interface BacklogModalsProps {
	projectId: string
	isCreateSprintModalOpen: boolean
	setIsCreateSprintModalOpen: Dispatch<SetStateAction<boolean>>
	editingSprint: Sprint | null
	setEditingSprint: Dispatch<SetStateAction<Sprint | null>>
	sprintToComplete: Sprint | null
	setSprintToComplete: Dispatch<SetStateAction<Sprint | null>>
	sprintToDelete: Sprint | null
	setSprintToDelete: Dispatch<SetStateAction<Sprint | null>>
	sprintToStart: Sprint | null
	setSprintToStart: Dispatch<SetStateAction<Sprint | null>>
	taskToDelete: KanbanTask | null
	setTaskToDelete: Dispatch<SetStateAction<KanbanTask | null>>
	handleCompleteSprintConfirm: () => Promise<void>
	handleDeleteSprintConfirm: () => Promise<void>
	handleStartSprintConfirm: () => Promise<void>
	handleDeleteConfirm: () => Promise<void>
}

export const BacklogModals = ({
	projectId,
	isCreateSprintModalOpen,
	setIsCreateSprintModalOpen,
	editingSprint,
	setEditingSprint,
	sprintToComplete,
	setSprintToComplete,
	sprintToDelete,
	setSprintToDelete,
	sprintToStart,
	setSprintToStart,
	taskToDelete,
	setTaskToDelete,
	handleCompleteSprintConfirm,
	handleDeleteSprintConfirm,
	handleStartSprintConfirm,
	handleDeleteConfirm,
}: BacklogModalsProps) => {
	return (
		<>
			<Modal isVisible={isCreateSprintModalOpen} onClose={() => setIsCreateSprintModalOpen(false)}>
				<CreateSprintModal projectId={projectId} onClose={() => setIsCreateSprintModalOpen(false)} />
			</Modal>

			{editingSprint && (
				<Modal isVisible={!!editingSprint} onClose={() => setEditingSprint(null)}>
					<EditSprintModal projectId={projectId} sprint={editingSprint} onClose={() => setEditingSprint(null)} />
				</Modal>
			)}

			<ConfirmModal
				isVisible={!!sprintToStart}
				onClose={() => setSprintToStart(null)}
				onConfirm={handleStartSprintConfirm}
				title='Start Sprint'
				message={
					<>
						Are you sure you want to start sprint &quot;
						<span className='highlight'>{sprintToStart?.name}</span>&quot;?
						<br />
						<span style={{ fontSize: '13px', color: 'var(--textSecondary)', marginTop: '8px', display: 'block' }}>
							This will make this sprint active and move its tasks into focus.
						</span>
					</>
				}
			/>

			<ConfirmModal
				isVisible={!!sprintToComplete}
				onClose={() => setSprintToComplete(null)}
				onConfirm={handleCompleteSprintConfirm}
				title='Complete Sprint'
				message={
					<>
						Are you sure you want to complete sprint &quot;
						<span className='highlight'>{sprintToComplete?.name}</span>&quot;?
						<br />
						<span style={{ fontSize: '13px', color: 'var(--textSecondary)', marginTop: '8px', display: 'block' }}>
							Completing this sprint will finish it and delete all associated tasks from the project.
						</span>
					</>
				}
			/>

			<ConfirmModal
				isVisible={!!sprintToDelete}
				onClose={() => setSprintToDelete(null)}
				onConfirm={handleDeleteSprintConfirm}
				title='Delete Sprint'
				message={
					<>
						Are you sure you want to delete sprint &quot;
						<span className='highlight'>{sprintToDelete?.name}</span>&quot;?
						<br />
						<span style={{ fontSize: '13px', color: '#dc2626', marginTop: '8px', display: 'block' }}>
							Warning: All tasks inside this sprint will also be permanently deleted.
						</span>
					</>
				}
			/>

			<ConfirmModal
				isVisible={!!taskToDelete}
				onClose={() => setTaskToDelete(null)}
				onConfirm={handleDeleteConfirm}
				title='Delete Task'
				message={
					<>
						Are you sure you want to permanently delete task &quot;
						<span className='highlight'>{taskToDelete?.title}</span>&quot;?
					</>
				}
			/>
		</>
	)
}
