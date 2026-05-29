'use client'

import { createContext, useContext, useState } from 'react'

export type LandingTheme = 'light' | 'dark'

interface LandingThemeContextValue {
	theme: LandingTheme
	toggleTheme: () => void
}

const LandingThemeContext = createContext<LandingThemeContextValue>({
	theme: 'light',
	toggleTheme: () => {},
})

export const useLandingTheme = () => useContext(LandingThemeContext)

function getInitialTheme(): LandingTheme {
	if (typeof window === 'undefined') return 'light'
	const saved = localStorage.getItem('landing-theme')
	return saved === 'dark' ? 'dark' : 'light'
}

export const LandingThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<LandingTheme>(getInitialTheme)

	const toggleTheme = () => {
		setTheme(prev => {
			const next = prev === 'light' ? 'dark' : 'light'
			localStorage.setItem('landing-theme', next)
			return next
		})
	}

	return <LandingThemeContext.Provider value={{ theme, toggleTheme }}>{children}</LandingThemeContext.Provider>
}
