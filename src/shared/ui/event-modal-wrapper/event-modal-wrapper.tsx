'use client'

import { deleteQuickIdea } from '@/lib/quick-ideas/quick-ideas'
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
	const titleParam = searchParams.get('title') || undefined
	const fromIdeaId = searchParams.get('fromIdeaId') || undefined

	const handleClose = () => {
		const params = new URLSearchParams(searchParams?.toString())
		params.delete('modal')
		params.delete('title')
		params.delete('fromIdeaId')
		const queryString = params.toString()

		router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })

		queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'] })
		queryClient.invalidateQueries({ queryKey: ['events-today-google'] })
		router.refresh()
	}

	const handleSuccess = async () => {
		if (fromIdeaId) {
			try {
				await deleteQuickIdea(fromIdeaId)
				queryClient.invalidateQueries({ queryKey: ['quick-ideas'] })
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('refresh-quick-ideas'))
				}
			} catch (err) {
				console.error('Failed to delete converted quick idea', err)
			}
		}
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<EventModal onClose={handleClose} initialTitle={titleParam} onSuccess={handleSuccess} />
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
