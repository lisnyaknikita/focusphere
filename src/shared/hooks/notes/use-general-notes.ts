'use client'

import { createGeneralNote, deleteGeneralNote, getGeneralNotes, updateGeneralNote } from '@/lib/notes/notes'
import { BaseNote } from '@/shared/types/project-note'
import { getBlockNotePreview } from '@/shared/utils/get-blocknote-preview/get-blocknote-preview'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '../use-debounce/use-debounce'

export const useGeneralNotes = (userId: string) => {
	const [notes, setNotes] = useState<BaseNote[]>([])
	const [activeNote, setActiveNote] = useState<BaseNote | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const debouncedSearch = useDebounce(searchQuery, 300)

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

		setActiveNote(prev => (prev?.$id === noteId ? { ...prev, title } : prev))

		try {
			await updateGeneralNote(noteId, { title })
		} catch (error) {
			console.error('Failed to update title:', error)
		}
	}, [])

	const handleContentChange = useCallback(async (content: string, noteId: string) => {
		setNotes(prev => prev.map(n => (n.$id === noteId ? { ...n, content } : n)))
		setActiveNote(prev => (prev?.$id === noteId ? { ...prev, content } : prev))
		try {
			await updateGeneralNote(noteId, { content })
		} catch (error) {
			console.error('Failed to update content:', error)
		}
	}, [])

	const handleDelete = async (noteId: string) => {
		const deletePromise = deleteGeneralNote(noteId)

		toast.promise(deletePromise, {
			loading: 'Deleting note...',
			success: 'Note deleted successfully',
			error: 'Failed to delete note',
		})

		try {
			await deletePromise
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

	const filteredNotes = useMemo(() => {
		const query = debouncedSearch.toLowerCase().trim()
		if (!query) return notes

		return notes.filter(note => {
			const plainText = getBlockNotePreview(note.content).toLowerCase()
			return note.title.toLowerCase().includes(query) || plainText.includes(query)
		})
	}, [notes, debouncedSearch])

	useEffect(() => {
		if (debouncedSearch.trim() !== '') {
			if (filteredNotes.length > 0) {
				setActiveNote(filteredNotes[0])
			} else {
				setActiveNote(null)
			}
		}
	}, [filteredNotes, debouncedSearch, setActiveNote])

	return {
		notes: filteredNotes,
		activeNote,
		setActiveNote,
		isLoading,
		createNote: handleCreate,
		deleteNote: handleDelete,
		handleTitleChange,
		handleContentChange,
		searchQuery,
		setSearchQuery,
	}
}
