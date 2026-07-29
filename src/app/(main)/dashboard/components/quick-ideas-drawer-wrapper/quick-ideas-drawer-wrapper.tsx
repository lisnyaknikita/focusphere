'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { QuickIdeasDrawer } from './quick-ideas-drawer/quick-ideas-drawer'

const QuickIdeasDrawerContent = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('drawer') === 'quick-ideas'

	const handleClose = () => {
		router.push('/dashboard', { scroll: false })
	}

	return <QuickIdeasDrawer isOpen={isOpen} onClose={handleClose} />
}

export const QuickIdeasDrawerWrapper = () => {
	return (
		<Suspense fallback={null}>
			<QuickIdeasDrawerContent />
		</Suspense>
	)
}
