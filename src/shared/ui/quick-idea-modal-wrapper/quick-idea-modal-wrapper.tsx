'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { QuickIdeaModal } from '../quick-idea-modal/quick-idea-modal'

export const QuickIdeaModalWrapper = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('modal') === 'quick-idea'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('modal')

		const queryString = params.toString()
		const targetUrl = queryString ? `${pathname}?${queryString}` : pathname

		router.push(targetUrl, { scroll: false })
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<QuickIdeaModal onClose={handleClose} />
		</Modal>
	)
}
