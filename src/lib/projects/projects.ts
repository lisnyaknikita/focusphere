import { CreateProjectPayload, Project } from '@/shared/types/project'
import { Client, ID, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

export const createProject = async (data: CreateProjectPayload) => {
	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: ID.unique(),
		data,
	})
}

export const getProjectById = async (projectId: string): Promise<Project> => {
	const response = await tablesDB.getRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
	})

	return response as unknown as Project
}

export const updateProject = async (projectId: string, data: Partial<CreateProjectPayload>): Promise<Project> => {
	const response = await tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
		data,
	})

	return response as unknown as Project
}
