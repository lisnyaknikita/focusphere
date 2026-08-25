import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EditorWidthMode = 'centered' | 'full'

interface TextEditorState {
	widthMode: EditorWidthMode
	toggleWidthMode: () => void
	setWidthMode: (mode: EditorWidthMode) => void
}

export const useTextEditorStore = create<TextEditorState>()(
	persist(
		set => ({
			widthMode: 'centered',
			toggleWidthMode: () =>
				set(s => ({
					widthMode: s.widthMode === 'centered' ? 'full' : 'centered',
				})),
			setWidthMode: mode => set({ widthMode: mode }),
		}),
		{ name: 'focusphere_editor_settings' }
	)
)
