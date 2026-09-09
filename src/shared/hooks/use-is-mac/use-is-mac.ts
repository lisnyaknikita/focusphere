'use client'

import { useEffect, useState } from 'react'

export const useIsMac = () => {
	const [isMac, setIsMac] = useState(true)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const userAgent = window.navigator.userAgent.toUpperCase()
			setIsMac(userAgent.includes('MAC'))
		}
	}, [])

	return isMac
}
