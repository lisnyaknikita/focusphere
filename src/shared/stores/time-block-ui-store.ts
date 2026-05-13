import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimeBlockUIState {
	isEnabled: boolean
	setEnabled: (value: boolean) => void
}

export const useTimeBlockUIStore = create<TimeBlockUIState>()(
	persist(
		set => ({
			isEnabled: false,
			setEnabled: value => set({ isEnabled: value }),
		}),
		{ name: 'focusphere_ui_timeblock' }
	)
)
