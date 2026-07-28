'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuickIdeaModal } from '../quick-idea-modal/quick-idea-modal'

export const QuickIdeaModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const isOpen = searchParams.get('modal') === 'quick-idea'

	const handleClose = () => {
		router.push('/dashboard')
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<QuickIdeaModal onClose={handleClose} />
		</Modal>
	)
}
