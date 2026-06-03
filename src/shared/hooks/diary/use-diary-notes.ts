'use client'

import { createDiaryEntry, deleteDiaryEntry, getDiaryEntries, updateDiaryEntry } from '@/lib/diary/diary'
import { deleteCustomTemplate, getCustomTemplates } from '@/lib/diary/templates'
import { JOURNAL_TEMPLATES } from '@/shared/constants/journal-templates'
import { CustomJournalTemplate, JournalEntry, TemplateKey } from '@/shared/types/journal'
import { PartialBlock } from '@blocknote/core'
import { useCallback, useEffect, useState } from 'react'

export const useDiaryNotes = (userId: string) => {
	const [notes, setNotes] = useState<JournalEntry[]>([])
	const [activeNote, setActiveNote] = useState<JournalEntry | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [customTemplates, setCustomTemplates] = useState<CustomJournalTemplate[]>([])

	useEffect(() => {
		const fetchEntries = async () => {
			if (!userId) return
			try {
				setIsLoading(true)

				const [entries, templates] = await Promise.all([getDiaryEntries(userId), getCustomTemplates(userId)])

				setNotes(entries)
				setCustomTemplates(templates)

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

	const addCustomTemplateState = (newTemplate: CustomJournalTemplate) => {
		setCustomTemplates(prev => [newTemplate, ...prev])
	}

	const createNote = async (templateSource: TemplateKey | CustomJournalTemplate = 'empty') => {
		if (!userId) return

		let initialBlocks: PartialBlock[] = [{ type: 'paragraph', content: [] }]
		let title = ''
		let templateKey: string = 'empty'

		const defaultTitleStr = new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})

		if (typeof templateSource === 'string') {
			if (templateSource !== 'empty') {
				const template = JOURNAL_TEMPLATES[templateSource as keyof typeof JOURNAL_TEMPLATES]
				if (template) {
					initialBlocks = template.content
					title = template.title
					templateKey = templateSource
				}
			}
		} else {
			initialBlocks = JSON.parse(templateSource.content)
			title = templateSource.title
			templateKey = templateSource.$id
		}

		const payload = {
			title: title || `Entry - ${defaultTitleStr}`,
			content: JSON.stringify(initialBlocks),
			templateKey: templateKey as TemplateKey,
			userId,
		}

		try {
			const newEntry = await createDiaryEntry(payload)
			setNotes(prev => [newEntry, ...prev])
			setActiveNote(newEntry)
		} catch (error) {
			console.error('Failed to create diary entry from template:', error)
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

	const deleteCustomTemplateAction = async (templateId: string) => {
		try {
			await deleteCustomTemplate(templateId)
			setCustomTemplates(prev => prev.filter(t => t.$id !== templateId))
		} catch (error) {
			console.error('Failed to delete custom template:', error)
			throw error
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
		customTemplates,
		addCustomTemplateState,
		deleteCustomTemplateAction,
	}
}
