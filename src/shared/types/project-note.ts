import { Models } from 'appwrite'

export interface ProjectNote extends Models.Document {
	title: string
	content: string
	projectId: string
	userId: string
}

export interface CreateProjectNotePayload {
	title: string
	content: string
	projectId: string
	userId: string
}

export type UpdateProjectNotePayload = Partial<CreateProjectNotePayload>
