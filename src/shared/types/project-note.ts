import { Models } from 'appwrite'

export interface BaseNote extends Models.Document {
	title: string
	content: string
	userId: string
	isPinned?: boolean
}

export interface ProjectNote extends BaseNote {
	projectId: string
	linkedTaskCode?: string
}

export interface CreateProjectNotePayload {
	title: string
	content: string
	projectId: string
	userId: string
	linkedTaskCode?: string
	isPinned?: boolean
}

export interface CreateGeneralNotePayload {
	title: string
	content: string
	userId: string
	isPinned?: boolean
}

export type UpdateProjectNotePayload = Partial<CreateProjectNotePayload>
export type UpdateGeneralNotePayload = Partial<CreateGeneralNotePayload>
