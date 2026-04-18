'use client'

import { EventModal } from '@/app/(main)/calendar/components/event-modal/event-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'

export const EventModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const queryClient = useQueryClient()

	const isOpen = searchParams.get('modal') === 'create-event'

	const handleClose = () => {
		router.push('/dashboard')
		queryClient.invalidateQueries({ queryKey: ['events-today'] })
		router.refresh()
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<EventModal onClose={handleClose} />
		</Modal>
	)
}
