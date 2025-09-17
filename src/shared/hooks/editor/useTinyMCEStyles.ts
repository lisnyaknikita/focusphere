'use client'

import { useEffect, useState } from 'react'

export const useTinyMCEStyles = () => {
	const [contentStyle, setContentStyle] = useState('')
	const [editorKey, setEditorKey] = useState(0)

	useEffect(() => {
		const updateStyles = () => {
			const root = getComputedStyle(document.documentElement)
			const textColor = root.getPropertyValue('--text').trim()
			const primaryColor = root.getPropertyValue('--primary').trim()

			const style = `
				body {
					font-family: Helvetica, Arial, sans-serif;
					font-size: 16px;
					line-height: 1;
					color: ${textColor};
					background-color: ${primaryColor};
					padding: 0rem;
				}
				h1, h2, h3, h4 {
					margin-top: 1.4em;
				}
			`
			setContentStyle(style)
			setEditorKey(prev => prev + 1)
		}

		updateStyles()

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		mediaQuery.addEventListener('change', updateStyles)

		const observer = new MutationObserver(updateStyles)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => {
			mediaQuery.removeEventListener('change', updateStyles)
			observer.disconnect()
		}
	}, [])

	return { contentStyle, editorKey }
}
