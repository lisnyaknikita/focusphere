'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { QuickIdeaModal } from '../quick-idea-modal/quick-idea-modal'

const QuickIdeaModalContent = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const isOpen = searchParams.get('modal') === 'quick-idea'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('modal')

		const queryString = params.toString()
		const targetUrl = queryString ? `${pathname}?${queryString}` : pathname

		router.push(targetUrl, { scroll: false })
	}

	if (!isMounted) return null

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<QuickIdeaModal onClose={handleClose} />
		</Modal>
	)
}

export const QuickIdeaModalWrapper = () => {
	return (
		<Suspense fallback={null}>
			<QuickIdeaModalContent />
		</Suspense>
	)
}
