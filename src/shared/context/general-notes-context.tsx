'use client'

import { ReactNode } from 'react'
import { useGeneralNotes } from '../hooks/notes/use-general-notes'
import { NotesContext } from './notes-context'

export const GeneralNotesProvider = ({ userId, children }: { userId: string; children: ReactNode }) => {
	const notesData = useGeneralNotes(userId)

	return (
		<NotesContext.Provider
			value={{
				...notesData,
				headerTitle: 'My Notes',
			}}
		>
			{children}
		</NotesContext.Provider>
	)
}
