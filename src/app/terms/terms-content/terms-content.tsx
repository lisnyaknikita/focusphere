'use client'

import { useEffect, useState } from 'react'

export const TermsContent = ({ html }: { html: string }) => {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return <div className='py-20 text-center'>Loading...</div>

	return <div dangerouslySetInnerHTML={{ __html: html }} />
}
