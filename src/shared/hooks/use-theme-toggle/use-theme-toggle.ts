'use client'

import { useEffect, useState } from 'react'

export const useThemeToggle = () => {
	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false
		return document.documentElement.classList.contains('dark')
	})

	useEffect(() => {
		const checkIsDark = () => document.documentElement.classList.contains('dark')

		const savedTheme = localStorage.getItem('theme')
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const initialIsDark = savedTheme ? savedTheme === 'dark' : prefersDark

		setIsDark(initialIsDark)
		document.documentElement.classList.toggle('dark', initialIsDark)
		document.documentElement.classList.toggle('light', !initialIsDark)

		const observer = new MutationObserver(() => {
			setIsDark(checkIsDark())
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => {
			observer.disconnect()
		}
	}, [])

	const handleToggle = () => {
		const nextIsDark = !isDark
		const newTheme = nextIsDark ? 'dark' : 'light'
		localStorage.setItem('theme', newTheme)
		document.documentElement.classList.toggle('dark', nextIsDark)
		document.documentElement.classList.toggle('light', !nextIsDark)
	}

	return { isDark, handleToggle }
}
