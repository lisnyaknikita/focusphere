import { CreateProjectNotePayload, ProjectNote, UpdateProjectNotePayload } from '@/shared/types/project-note'
import { Client, ID, Query, TablesDB } from 'appwrite'
import { touchProject } from '../projects'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_PROJECT_NOTES!

export const getProjectNotes = async (projectId: string): Promise<ProjectNote[]> => {
	const response = await tablesDB.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('projectId', projectId), Query.orderDesc('$createdAt')],
	})

	return response.rows as unknown as ProjectNote[]
}

export const createProjectNote = async (data: CreateProjectNotePayload): Promise<ProjectNote> => {
	const response = await tablesDB.createRow({
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
	const response = await tablesDB.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
		data,
	})

	await touchProject(projectId)

	return response as unknown as ProjectNote
}

export const deleteProjectNote = async (projectId: string, noteId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
	})

	await touchProject(projectId)
}
