import { Models } from 'appwrite'

export interface BaseNote extends Models.Document {
	title: string
	content: string
	userId: string
}

export interface ProjectNote extends BaseNote {
	projectId: string
}

export interface CreateProjectNotePayload {
	title: string
	content: string
	projectId: string
	userId: string
}

export type UpdateProjectNotePayload = Partial<CreateProjectNotePayload>
