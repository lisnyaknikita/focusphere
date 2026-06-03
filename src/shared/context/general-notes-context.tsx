'use client'

import { ReactNode } from 'react'
import { useGeneralNotes } from '../hooks/notes/use-general-notes'
import { CustomJournalTemplate } from '../types/journal'
import { NotesContext } from './notes-context'

export const GeneralNotesProvider = ({ userId, children }: { userId: string; children: ReactNode }) => {
	const notesData = useGeneralNotes(userId)

	return (
		<NotesContext.Provider
			value={{
				...notesData,
				createNote: notesData.createNote as (
					hint?: string | CustomJournalTemplate,
					linkedTaskCode?: string
				) => Promise<void>,
				headerTitle: 'My Notes',
			}}
		>
			{children}
		</NotesContext.Provider>
	)
}
