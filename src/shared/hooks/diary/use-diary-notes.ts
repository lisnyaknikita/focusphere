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

		const template = templateKey !== 'empty' ? JOURNAL_TEMPLATES[templateKey as keyof typeof JOURNAL_TEMPLATES] : null

		const initialBlocks = template?.content || [{ type: 'paragraph', content: [] }]
		const contentString = JSON.stringify(initialBlocks)

		const defaultTitle = new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})

		const payload = {
			title: template?.title || `Entry - ${defaultTitle}`,
			content: contentString,
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
			setNotes(prev => {
				const noteIndex = prev.findIndex(n => n.$id === noteId)
				if (noteIndex === -1) return prev
				const updatedNote = { ...prev[noteIndex], title }
				const newNotes = [...prev]
				newNotes.splice(noteIndex, 1)
				return [updatedNote, ...newNotes]
			})
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
			setNotes(prev => {
				const noteIndex = prev.findIndex(n => n.$id === noteId)
				if (noteIndex === -1) return prev
				const updatedNote = { ...prev[noteIndex], content }
				const newNotes = [...prev]
				newNotes.splice(noteIndex, 1)
				return [updatedNote, ...newNotes]
			})

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
