'use client'

import { ReactNode } from 'react'
import { useDiaryNotes } from '../hooks/diary/use-diary-notes'
import { TemplateKey } from '../types/journal'
import { BaseNote } from '../types/project-note'
import { NotesContext } from './notes-context'

export const DiaryProvider = ({ userId, children }: { userId: string; children: ReactNode }) => {
	const diaryData = useDiaryNotes(userId)

	return (
		<NotesContext.Provider
			value={{
				notes: diaryData.notes,
				activeNote: diaryData.activeNote,
				setActiveNote: diaryData.setActiveNote as (note: BaseNote | null) => void,
				handleContentChange: diaryData.handleContentChange,
				handleTitleChange: diaryData.handleTitleChange,
				createNote: templateKey => diaryData.createNote(templateKey as TemplateKey),
				deleteNote: diaryData.deleteNote,
				isLoading: diaryData.isLoading,
				headerTitle: 'Daily Journal',
			}}
		>
			{children}
		</NotesContext.Provider>
	)
}
