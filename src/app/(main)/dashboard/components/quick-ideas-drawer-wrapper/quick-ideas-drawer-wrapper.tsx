'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { QuickIdeasDrawer } from './quick-ideas-drawer/quick-ideas-drawer'

const QuickIdeasDrawerContent = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const isOpen = searchParams.get('drawer') === 'quick-ideas'

	const handleClose = () => {
		const params = new URLSearchParams(searchParams?.toString())
		params.delete('drawer')
		const queryString = params.toString()

		router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
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
