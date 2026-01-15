import {
	createProjectNote,
	deleteProjectNote,
	getProjectNotes,
	updateProjectNote,
} from '@/lib/projects/project-notes/notes'
import { touchProject } from '@/lib/projects/projects'
import { Project } from '@/shared/types/project'
import { CreateProjectNotePayload, ProjectNote } from '@/shared/types/project-note'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '../../use-user/use-user'

export const useNotes = (project: Project) => {
	const [notes, setNotes] = useState<ProjectNote[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [activeNote, setActiveNote] = useState<ProjectNote | null>(null)

	const { user } = useUser()
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const triggerProjectUpdate = () => {
		touchProject(project.$id).catch(console.error)
	}

	useEffect(() => {
		if (!project?.$id) return

		const fetchNotes = async () => {
			try {
				setIsLoading(true)
				const data = await getProjectNotes(project.$id)
				setNotes(data)
				if (data.length > 0) setActiveNote(data[0])
			} catch (error) {
				console.error(error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchNotes()
	}, [project?.$id])

	const createNote = async (title: string = 'New Note') => {
		try {
			const payload: CreateProjectNotePayload = {
				title,
				content: '',
				projectId: project?.$id,
				userId: user?.$id || '',
			}

			const newNote = await createProjectNote(payload)
			setNotes(prev => [newNote, ...prev])
			setActiveNote(newNote)
			triggerProjectUpdate()
		} catch (error) {
			console.error(error)
		}
	}

	const deleteNote = async (noteId: string) => {
		try {
			await deleteProjectNote(project?.$id, noteId)
			setNotes(prev => prev.filter(item => item.$id !== noteId))
			if (activeNote?.$id === noteId) setActiveNote(notes[0] || null)
			triggerProjectUpdate()
		} catch (error) {
			console.error(error)
		}
	}

	const handleContentChange = useCallback(
		(content: string) => {
			if (!activeNote) return

			setNotes(prev => prev.map(n => (n.$id === activeNote.$id ? { ...n, content } : n)))
			setActiveNote(prev => (prev ? { ...prev, content } : null))

			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

			saveTimeoutRef.current = setTimeout(async () => {
				try {
					await updateProjectNote(project.$id, activeNote.$id, { content })
				} catch (err) {
					console.error('Auto-save failed', err)
				}
			}, 1200)
		},
		[activeNote, project?.$id]
	)

	return {
		notes,
		isLoading,
		activeNote,
		createNote,
		deleteNote,
		setActiveNote,
		handleContentChange,
	}
}
