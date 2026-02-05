'use client'

import { createGeneralNote, deleteGeneralNote, getGeneralNotes, updateGeneralNote } from '@/lib/notes/notes'
import { BaseNote } from '@/shared/types/project-note'
import { useCallback, useEffect, useState } from 'react'

export const useGeneralNotes = (userId: string) => {
	const [notes, setNotes] = useState<BaseNote[]>([])
	const [activeNote, setActiveNote] = useState<BaseNote | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchNotes = async () => {
			if (!userId) return
			try {
				setIsLoading(true)
				const data = await getGeneralNotes(userId)
				setNotes(data)
				if (data.length > 0) setActiveNote(data[0])
			} catch (error) {
				console.error('Failed to fetch notes:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchNotes()
	}, [userId])

	const handleCreate = async (title: string = 'New Note') => {
		if (!userId) return
		try {
			const newNote = await createGeneralNote({ title, content: '', userId })
			setNotes(prev => [newNote, ...prev])
			setActiveNote(newNote)
		} catch (error) {
			console.error('Failed to create note:', error)
		}
	}

	const handleTitleChange = useCallback(async (title: string, noteId: string) => {
		setNotes(prev => prev.map(n => (n.$id === noteId ? { ...n, title } : n)))
		try {
			await updateGeneralNote(noteId, { title })
		} catch (error) {
			console.error('Failed to update title:', error)
		}
	}, [])

	const handleContentChange = useCallback(async (content: string, noteId: string) => {
		setNotes(prev => prev.map(n => (n.$id === noteId ? { ...n, content } : n)))
		try {
			await updateGeneralNote(noteId, { content })
		} catch (error) {
			console.error('Failed to update content:', error)
		}
	}, [])

	const handleDelete = async (noteId: string) => {
		try {
			await deleteGeneralNote(noteId)
			setNotes(prev => {
				const filtered = prev.filter(n => n.$id !== noteId)
				if (activeNote?.$id === noteId) {
					setActiveNote(filtered.length > 0 ? filtered[0] : null)
				}
				return filtered
			})
		} catch (error) {
			console.error('Failed to delete note:', error)
		}
	}

	return {
		notes,
		activeNote,
		setActiveNote,
		isLoading,
		createNote: handleCreate,
		deleteNote: handleDelete,
		handleTitleChange,
		handleContentChange,
	}
}
