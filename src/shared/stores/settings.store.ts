import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimeFormat = '12h' | '24h'

interface SettingsState {
	timeFormat: TimeFormat
	setTimeFormat: (format: TimeFormat) => void
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		set => ({
			timeFormat: '12h',
			setTimeFormat: timeFormat => set({ timeFormat }),
		}),
		{
			name: 'focusphere_general_settings',
		}
	)
)
