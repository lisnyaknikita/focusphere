'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ShortcutsModal } from './shortcuts-modal'

const ShortcutsModalContent = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('modal') === 'shortcuts'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams?.toString())
		params.delete('modal')
		const queryString = params.toString()
		router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<ShortcutsModal onClose={handleClose} />
		</Modal>
	)
}

export const ShortcutsModalWrapper = () => {
	return (
		<Suspense fallback={null}>
			<ShortcutsModalContent />
		</Suspense>
	)
}
