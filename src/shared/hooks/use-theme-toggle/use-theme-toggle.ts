'use client'

import { useEffect, useState } from 'react'

export const useThemeToggle = () => {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

		const initialIsDark = savedTheme ? savedTheme === 'dark' : prefersDark

		setIsDark(initialIsDark)
		document.documentElement.classList.toggle('dark', initialIsDark)
		document.documentElement.classList.toggle('light', !initialIsDark)
	}, [])

	const handleToggle = () => {
		setIsDark(prev => {
			const newTheme = !prev ? 'dark' : 'light'
			localStorage.setItem('theme', newTheme)
			document.documentElement.classList.toggle('dark', !prev)
			document.documentElement.classList.toggle('light', prev)
			return !prev
		})
	}

	return { isDark, handleToggle }
}
