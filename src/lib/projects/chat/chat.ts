import { CreateChannelPayload, CreateMessagePayload } from '@/shared/types/chat'
import { Client, ID, Permission, Query, Role, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const CHANNELS_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_CHANNELS!
const MESSAGES_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_MESSAGES!

export const getChannels = async (projectId: string) => {
	return tablesDB.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		queries: [Query.equal('projectId', projectId)],
	})
}

export const createChannel = async (payload: CreateChannelPayload) => {
	const permissions = [
		Permission.read(Role.user(payload.ownerId)),
		Permission.update(Role.user(payload.ownerId)),
		Permission.delete(Role.user(payload.ownerId)),
	]

	if (payload.teamId) {
		permissions.push(Permission.read(Role.team(payload.teamId)))
	}

	const { ...data } = payload

	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		rowId: ID.unique(),
		data,
		permissions,
	})
}

export const getMessages = async (channelId: string) => {
	return tablesDB.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		queries: [Query.equal('channelId', channelId), Query.orderAsc('$createdAt'), Query.limit(100)],
	})
}

export const sendMessage = async (payload: CreateMessagePayload, teamId?: string) => {
	const permissions = [
		Permission.read(Role.any()),
		Permission.update(Role.user(payload.senderId)),
		Permission.delete(Role.user(payload.senderId)),
	]

	if (teamId) {
		permissions.push(Permission.read(Role.team(teamId)))
	}

	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: ID.unique(),
		data: payload,
		permissions,
	})
}
