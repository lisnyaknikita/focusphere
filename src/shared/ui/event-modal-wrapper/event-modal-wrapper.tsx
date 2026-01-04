'use client'

import { EventModal } from '@/app/(main)/calendar/components/event-modal/event-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { useRouter, useSearchParams } from 'next/navigation'

export const EventModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('modal') === 'create-event'

	const handleClose = () => {
		router.push('/')
		const event = new CustomEvent('refresh-events')
		window.dispatchEvent(event)
		router.refresh()
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<EventModal onClose={handleClose} />
		</Modal>
	)
}
