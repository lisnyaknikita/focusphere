import {
	createProjectNote,
	deleteProjectNote,
	getProjectNotes,
	updateProjectNote,
} from '@/lib/projects/project-notes/notes'
import { touchProject } from '@/lib/projects/projects'
import { Project } from '@/shared/types/project'
import { CreateProjectNotePayload, ProjectNote } from '@/shared/types/project-note'
import { useCallback, useEffect, useState } from 'react'
import { useUser } from '../../use-user/use-user'

export const useNotes = (project: Project) => {
	const [notes, setNotes] = useState<ProjectNote[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [activeNote, setActiveNote] = useState<ProjectNote | null>(null)

	const { user, loading: isUserLoading } = useUser()

	const triggerProjectUpdate = useCallback(() => {
		if (project?.$id) {
			touchProject(project.$id).catch(console.error)
		}
	}, [project?.$id])

	useEffect(() => {
		if (!project?.$id || isUserLoading) return

		const fetchNotes = async () => {
			try {
				setIsLoading(true)
				const data = await getProjectNotes(project.$id)
				const filteredData = data.filter(note => !note.linkedTaskCode || note.userId === user?.$id)
				setNotes(filteredData)
				if (filteredData.length > 0) {
					setActiveNote(filteredData[0])
				} else {
					setActiveNote(null)
				}
			} catch (error) {
				console.error(error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchNotes()
	}, [project?.$id, user?.$id, isUserLoading])

	const createNote = useCallback(
		async (title: string = 'New Note', linkedTaskCode?: string) => {
			try {
				const payload: CreateProjectNotePayload = {
					title,
					content: '',
					projectId: project?.$id,
					userId: user?.$id || '',
					linkedTaskCode,
				}

				const newNote = await createProjectNote(payload)
				setNotes(prev => [newNote, ...prev])
				setActiveNote(newNote)
				triggerProjectUpdate()
			} catch (error) {
				console.error(error)
			}
		},
		[project?.$id, user?.$id, triggerProjectUpdate]
	)

	const deleteNote = useCallback(
		async (noteId: string) => {
			try {
				await deleteProjectNote(project?.$id, noteId)
				setNotes(prev => {
					const filtered = prev.filter(item => item.$id !== noteId)
					setActiveNote(active => {
						if (active?.$id === noteId) {
							return filtered.length > 0 ? filtered[0] : null
						}
						return active
					})
					return filtered
				})
				triggerProjectUpdate()
			} catch (error) {
				console.error(error)
			}
		},
		[project?.$id, triggerProjectUpdate]
	)

	const handleContentChange = useCallback(
		async (content: string, noteId: string) => {
			if (!noteId) return

			setNotes(prev => {
				const noteIndex = prev.findIndex(n => n.$id === noteId)
				if (noteIndex === -1) return prev
				const updatedNote = { ...prev[noteIndex], content }
				const newNotes = [...prev]
				newNotes.splice(noteIndex, 1)
				return [updatedNote, ...newNotes]
			})
			setActiveNote(prev => (prev?.$id === noteId ? { ...prev, content } : prev))

			try {
				await updateProjectNote(project.$id, noteId, { content })
				triggerProjectUpdate()
			} catch (err) {
				console.error('Auto-save failed', err)
				throw err
			}
		},
		[project?.$id, triggerProjectUpdate]
	)

	const handleTitleChange = useCallback(
		async (title: string, noteId: string) => {
			if (!noteId) return

			setNotes(prev => {
				const noteIndex = prev.findIndex(n => n.$id === noteId)
				if (noteIndex === -1) return prev
				const updatedNote = { ...prev[noteIndex], title }
				const newNotes = [...prev]
				newNotes.splice(noteIndex, 1)
				return [updatedNote, ...newNotes]
			})
			setActiveNote(prev => (prev?.$id === noteId ? { ...prev, title } : prev))

			try {
				const finalTitle = title.trim() === '' ? 'Untitled Note' : title
				await updateProjectNote(project.$id, noteId, { title: finalTitle })
				triggerProjectUpdate()
			} catch (err) {
				console.error('Title save failed', err)
				throw err
			}
		},
		[project?.$id, triggerProjectUpdate]
	)

	return {
		notes,
		isLoading,
		activeNote,
		createNote,
		deleteNote,
		setActiveNote,
		handleContentChange,
		handleTitleChange,
	}
}
