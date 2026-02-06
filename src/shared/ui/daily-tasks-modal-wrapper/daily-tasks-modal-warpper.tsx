'use client'

import { DailyTasksModal } from '@/app/(main)/planner/components/main/daily-tasks-modal/daily-tasks-modal'
import { useToday } from '@/shared/hooks/date/use-today'
import { useRouter, useSearchParams } from 'next/navigation'
import { Modal } from '../modal/modal'

export const DailyTasksModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const today = useToday()

	const isOpen = searchParams.get('modal') === 'create-daily-task'

	const handleClose = () => {
		router.push('/')
		const event = new CustomEvent('refresh-daily-tasks')
		window.dispatchEvent(event)
		router.refresh()
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<DailyTasksModal date={today ? today?.iso : ''} onClose={handleClose} />
		</Modal>
	)
}
