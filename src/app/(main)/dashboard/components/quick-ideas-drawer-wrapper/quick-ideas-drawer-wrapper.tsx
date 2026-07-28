'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { QuickIdeasDrawer } from './quick-ideas-drawer/quick-ideas-drawer'

export const QuickIdeasDrawerWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('drawer') === 'quick-ideas'

	const handleClose = () => {
		router.push('/dashboard', { scroll: false })
	}

	return <QuickIdeasDrawer isOpen={isOpen} onClose={handleClose} />
}
