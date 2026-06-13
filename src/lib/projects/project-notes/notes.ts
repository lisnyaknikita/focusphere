import { db } from '@/lib/appwrite'
import { CreateProjectNotePayload, ProjectNote, UpdateProjectNotePayload } from '@/shared/types/project-note'
import { ID, Query } from 'appwrite'
import { touchProject } from '../projects'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_PROJECT_NOTES!

export const getProjectNotes = async (projectId: string): Promise<ProjectNote[]> => {
	const response = await db.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('projectId', projectId), Query.orderDesc('$updatedAt')],
	})

	return response.rows as unknown as ProjectNote[]
}

export const createProjectNote = async (data: CreateProjectNotePayload): Promise<ProjectNote> => {
	const response = await db.createRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ID.unique(),
		data,
	})

	await touchProject(data.projectId)

	return response as unknown as ProjectNote
}

export const updateProjectNote = async (
	projectId: string,
	noteId: string,
	data: UpdateProjectNotePayload
): Promise<ProjectNote> => {
	const response = await db.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
		data,
	})

	await touchProject(projectId)

	return response as unknown as ProjectNote
}

export const deleteProjectNote = async (projectId: string, noteId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
	})

	await touchProject(projectId)
}
