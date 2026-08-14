'use client'

import { EventModal } from '@/app/(main)/calendar/components/event-modal/event-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const EventModalContent = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const queryClient = useQueryClient()

	const isOpen = searchParams.get('modal') === 'create-event'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams?.toString())
		params.delete('modal')
		const queryString = params.toString()

		router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })

		queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'] })
		queryClient.invalidateQueries({ queryKey: ['events-today-google'] })
		router.refresh()
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<EventModal onClose={handleClose} />
		</Modal>
	)
}

export const EventModalWrapper = () => {
	return (
		<Suspense fallback={null}>
			<EventModalContent />
		</Suspense>
	)
}
