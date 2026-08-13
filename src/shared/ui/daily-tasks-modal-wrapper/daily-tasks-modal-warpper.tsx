'use client'

import { DailyTasksModal } from '@/app/(main)/planner/components/main/daily-tasks-modal/daily-tasks-modal'
import { useToday } from '@/shared/hooks/date/use-today'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Modal } from '../modal/modal'

const DailyTasksModalContent = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const today = useToday()

	const isOpen = searchParams.get('modal') === 'create-daily-task'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams?.toString())
		params.delete('modal')
		const queryString = params.toString()

		router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })

		const event = new CustomEvent('refresh-daily-tasks')
		window.dispatchEvent(event)
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<DailyTasksModal date={today ? today?.iso : ''} onClose={handleClose} autoCreate />
		</Modal>
	)
}

export const DailyTasksModalWrapper = () => {
	return (
		<Suspense fallback={null}>
			<DailyTasksModalContent />
		</Suspense>
	)
}
