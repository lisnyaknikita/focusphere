'use client'

import { createDiaryEntry, deleteDiaryEntry, getDiaryEntries, updateDiaryEntry } from '@/lib/diary/diary'
import { JOURNAL_TEMPLATES } from '@/shared/constants/journal-templates'
import { JournalEntry, TemplateKey } from '@/shared/types/journal'
import { useCallback, useEffect, useState } from 'react'

export const useDiaryNotes = (userId: string) => {
	const [notes, setNotes] = useState<JournalEntry[]>([])
	const [activeNote, setActiveNote] = useState<JournalEntry | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchEntries = async () => {
			if (!userId) return
			try {
				setIsLoading(true)
				const entries = await getDiaryEntries(userId)
				setNotes(entries)
				if (entries.length > 0) {
					setActiveNote(entries[0])
				}
			} catch (error) {
				console.error('Failed to fetch diary entries:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchEntries()
	}, [userId])

	const createNote = async (templateKey: TemplateKey = 'empty') => {
		if (!userId) return

		const template = templateKey !== 'empty' ? JOURNAL_TEMPLATES[templateKey] : null

		const payload = {
			title: template?.title || 'Untitled Entry',
			content: template?.content || '',
			templateKey,
			userId,
		}

		try {
			const newEntry = await createDiaryEntry(payload)
			setNotes(prev => [newEntry, ...prev])
			setActiveNote(newEntry)
		} catch (error) {
			console.error('Failed to create diary entry:', error)
		}
	}

	const handleTitleChange = useCallback(
		async (title: string, noteId: string) => {
			setNotes(prev => prev.map(n => (n.$id === noteId ? { ...n, title } : n)))
			if (activeNote?.$id === noteId) {
				setActiveNote(prev => (prev ? { ...prev, title } : null))
			}

			try {
				await updateDiaryEntry(noteId, { title })
			} catch (error) {
				console.error('Failed to update title:', error)
			}
		},
		[activeNote?.$id]
	)

	const handleContentChange = useCallback(
		async (content: string, noteId: string) => {
			setNotes(prev => prev.map(n => (n.$id === noteId ? { ...n, content } : n)))

			if (activeNote?.$id === noteId) {
				setActiveNote(prev => (prev ? { ...prev, content } : null))
			}

			try {
				await updateDiaryEntry(noteId, { content })
			} catch (error) {
				console.error('Failed to update content:', error)
			}
		},
		[activeNote?.$id]
	)

	const deleteNote = async (noteId: string) => {
		try {
			await deleteDiaryEntry(noteId)

			setNotes(prev => {
				const filteredNotes = prev.filter(n => n.$id !== noteId)

				if (activeNote?.$id === noteId) {
					if (filteredNotes.length > 0) {
						setActiveNote(filteredNotes[0])
					} else {
						setActiveNote(null)
					}
				}

				return filteredNotes
			})
		} catch (error) {
			console.error('Failed to delete entry:', error)
		}
	}

	return {
		notes,
		activeNote,
		setActiveNote,
		isLoading,
		createNote,
		deleteNote,
		handleTitleChange,
		handleContentChange,
	}
}
