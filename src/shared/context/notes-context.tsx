'use client'

import { createContext, useContext } from 'react'
import { BaseNote } from '../types/project-note'

interface NotesContextType<T extends BaseNote = BaseNote> {
	notes: T[]
	activeNote: T | null
	setActiveNote: (note: T | null) => void
	handleContentChange: (content: string, noteId: string) => void
	handleTitleChange: (title: string, noteId: string) => void
	createNote: (hint?: string) => Promise<void>
	deleteNote: (noteId: string) => Promise<void>
	isLoading: boolean
	headerTitle?: string
	searchQuery?: string
	setSearchQuery?: (query: string) => void
}

export const NotesContext = createContext<NotesContextType<BaseNote> | undefined>(undefined)

export const useNotesContext = <T extends BaseNote>() => {
	const context = useContext(NotesContext) as NotesContextType<T> | undefined
	if (!context) throw new Error('useNotesContext must be used within a Provider')
	return context
}
