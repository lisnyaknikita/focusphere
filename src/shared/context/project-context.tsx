'use client'

import { getProjectById } from '@/lib/projects/projects'
import { createContext, ReactNode, useContext, useCallback, useMemo } from 'react'
import { useNotes } from '../hooks/projects/notes/use-notes'
import { CustomJournalTemplate } from '../types/journal'
import { Project } from '../types/project'
import { BaseNote, ProjectNote } from '../types/project-note'
import { NotesContext } from './notes-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface ProjectContextType {
	project: Project | null
	isLoading: boolean
	updateProjectState: (newData: Partial<Project>) => void
	notes: ProjectNote[]
	activeNote: ProjectNote | null
	setActiveNote: (note: ProjectNote | null) => void
	createNote: (title?: string, linkedTaskCode?: string) => Promise<void>
	deleteNote: (noteId: string) => Promise<void>
	handleContentChange: (content: string, noteId: string) => Promise<void>
	handleTitleChange: (title: string, noteId: string) => Promise<void>
	isNotesLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ projectId, children }: { projectId: string; children: ReactNode }) => {
	const queryClient = useQueryClient()

	const { data: project = null, isLoading } = useQuery<Project | null>({
		queryKey: ['project', projectId],
		queryFn: async () => {
			if (!projectId) return null
			return getProjectById(projectId)
		},
		enabled: !!projectId,
	})

	const notesData = useNotes(project!)

	const updateProjectState = useCallback((newData: Partial<Project>) => {
		queryClient.setQueryData(['project', projectId], (prev: Project | null) => {
			return prev ? { ...prev, ...newData } : null
		})
	}, [queryClient, projectId])

	const projectContextValue = useMemo(
		() => ({
			project,
			isLoading,
			updateProjectState,
			notes: notesData.notes,
			activeNote: notesData.activeNote,
			setActiveNote: notesData.setActiveNote,
			createNote: notesData.createNote,
			deleteNote: notesData.deleteNote,
			handleContentChange: notesData.handleContentChange,
			handleTitleChange: notesData.handleTitleChange,
			isNotesLoading: notesData.isLoading,
		}),
		[
			project,
			isLoading,
			updateProjectState,
			notesData.notes,
			notesData.activeNote,
			notesData.setActiveNote,
			notesData.createNote,
			notesData.deleteNote,
			notesData.handleContentChange,
			notesData.handleTitleChange,
			notesData.isLoading,
		]
	)

	const notesContextValue = useMemo(
		() => ({
			notes: notesData.notes,
			activeNote: notesData.activeNote,
			setActiveNote: notesData.setActiveNote as (note: BaseNote | null) => void,
			handleContentChange: notesData.handleContentChange,
			handleTitleChange: notesData.handleTitleChange,
			createNote: notesData.createNote as (
				hint?: string | CustomJournalTemplate,
				linkedTaskCode?: string
			) => Promise<void>,
			deleteNote: notesData.deleteNote,
			isLoading: notesData.isLoading,
		}),
		[
			notesData.notes,
			notesData.activeNote,
			notesData.setActiveNote,
			notesData.handleContentChange,
			notesData.handleTitleChange,
			notesData.createNote,
			notesData.deleteNote,
			notesData.isLoading,
		]
	)

	return (
		<ProjectContext.Provider value={projectContextValue}>
			<NotesContext.Provider value={notesContextValue}>{children}</NotesContext.Provider>
		</ProjectContext.Provider>
	)
}

export const useProject = () => {
	const context = useContext(ProjectContext)
	if (!context) throw new Error('useProject must be used within ProjectProvider')
	return context
}
