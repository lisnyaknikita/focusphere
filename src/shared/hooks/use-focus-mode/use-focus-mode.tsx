import { useFocusModeStore } from '@/shared/stores/focus-mode.store'
import { useEffect } from 'react'

type FocusPage = 'journal' | 'generalNotes' | 'projectNotes'

export const useFocusMode = (page: FocusPage) => {
	const isFocusMode = useFocusModeStore(s => s.focusModes[page])
	const toggleFocusMode = useFocusModeStore(s => s.toggleFocusMode)
	const setFocusMode = useFocusModeStore(s => s.setFocusMode)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isFocusMode) {
				setFocusMode(page, false)
			}
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
				e.preventDefault()
				toggleFocusMode(page)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isFocusMode, page, setFocusMode, toggleFocusMode])

	return { isFocusMode, toggleFocusMode }
}
