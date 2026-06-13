'use client'

import { createContext, useContext } from 'react'
import { CustomJournalTemplate } from '../types/journal'
import { BaseNote } from '../types/project-note'

interface NotesContextType<T extends BaseNote = BaseNote> {
	notes: T[]
	activeNote: T | null
	setActiveNote: (note: T | null) => void
	handleContentChange: (content: string, noteId: string) => Promise<void>
	handleTitleChange: (title: string, noteId: string) => Promise<void>
	createNote: (hint?: string | CustomJournalTemplate, linkedTaskCode?: string) => Promise<void>
	deleteNote: (noteId: string) => Promise<void>
	isLoading: boolean
	searchQuery?: string
	setSearchQuery?: (query: string) => void
	customTemplates?: CustomJournalTemplate[]
	addCustomTemplateState?: (newTemplate: CustomJournalTemplate) => void
	deleteCustomTemplate?: (templateId: string) => Promise<void>
}

export const NotesContext = createContext<NotesContextType<BaseNote> | undefined>(undefined)

export const useNotesContext = <T extends BaseNote>() => {
	const context = useContext(NotesContext) as NotesContextType<T> | undefined
	if (!context) throw new Error('useNotesContext must be used within a Provider')
	return context
}
