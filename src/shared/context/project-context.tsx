'use client'

import { getProjectById } from '@/lib/projects/projects'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useNotes } from '../hooks/projects/notes/use-notes'
import { Project } from '../types/project'
import { ProjectNote } from '../types/project-note'

interface ProjectContextType {
	project: Project | null
	isLoading: boolean
	updateProjectState: (newData: Partial<Project>) => void
	notes: ProjectNote[]
	activeNote: ProjectNote | null
	setActiveNote: (note: ProjectNote | null) => void
	createNote: (title?: string) => Promise<void>
	deleteNote: (noteId: string) => Promise<void>
	handleContentChange: (content: string, noteId: string) => void
	handleTitleChange: (title: string, noteId: string) => void
	isNotesLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ projectId, children }: { projectId: string; children: ReactNode }) => {
	const [project, setProject] = useState<Project | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchProject = async () => {
			try {
				setIsLoading(true)
				const data = await getProjectById(projectId)
				setProject(data)
			} catch (error) {
				console.error('Failed to fetch project:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (projectId) fetchProject()
	}, [projectId])

	const notesData = useNotes(project!)

	const updateProjectState = (newData: Partial<Project>) => {
		setProject(prev => (prev ? { ...prev, ...newData } : null))
	}

	return (
		<ProjectContext.Provider
			value={{
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
			}}
		>
			{children}
		</ProjectContext.Provider>
	)
}

export const useProject = () => {
	const context = useContext(ProjectContext)
	if (!context) throw new Error('useProject must be used within ProjectProvider')
	return context
}
