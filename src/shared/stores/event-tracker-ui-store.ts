import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EventTrackerUIState {
	isEnabled: boolean
	setEnabled: (isEnabled: boolean) => void
}

export const useEventTrackerUIStore = create<EventTrackerUIState>()(
	persist(
		set => ({ isEnabled: true, setEnabled: isEnabled => set({ isEnabled }) }),
		{ name: 'focusphere_ui_timeblock' }
	)
)
