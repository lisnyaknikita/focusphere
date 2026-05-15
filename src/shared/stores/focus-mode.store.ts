import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FocusModeState {
	focusModes: {
		journal: boolean
		generalNotes: boolean
		projectNotes: boolean
	}
	toggleFocusMode: (page: 'journal' | 'generalNotes' | 'projectNotes') => void
	setFocusMode: (page: 'journal' | 'generalNotes' | 'projectNotes', value: boolean) => void
}

export const useFocusModeStore = create<FocusModeState>()(
	persist(
		set => ({
			focusModes: { journal: false, generalNotes: false, projectNotes: false },
			toggleFocusMode: page =>
				set(s => ({
					focusModes: { ...s.focusModes, [page]: !s.focusModes[page] },
				})),
			setFocusMode: (page, value) =>
				set(s => ({
					focusModes: { ...s.focusModes, [page]: value },
				})),
		}),
		{ name: 'focusphere_focus_mode' }
	)
)
