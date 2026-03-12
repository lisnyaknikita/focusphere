import { CreateChannelPayload, CreateMessagePayload } from '@/shared/types/chat'
import { Client, ID, Permission, Query, Role, TablesDB, Teams } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)
const teams = new Teams(client)

const CHANNELS_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_CHANNELS!
const MESSAGES_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_MESSAGES!

export const getTeamMembers = async (teamId: string) => {
	return await teams.listMemberships(teamId)
}

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

export const updateChannel = async (channelId: string, name: string) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		rowId: channelId,
		data: { name },
	})
}

export const deleteChannel = async (channelId: string) => {
	return tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		rowId: channelId,
	})
}

export const getMessages = async (channelId: string) => {
	return tablesDB.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		queries: [Query.equal('channelId', channelId), Query.orderAsc('$createdAt'), Query.limit(100)],
	})
}

export const sendMessage = async (payload: CreateMessagePayload) => {
	const permissions = [
		Permission.read(Role.any()),
		Permission.update(Role.user(payload.senderId)),
		Permission.delete(Role.user(payload.senderId)),
	]

	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: ID.unique(),
		data: payload,
		permissions,
	})
}

export const updateMessage = async (messageId: string, content: string) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: messageId,
		data: { content },
	})
}

export const deleteMessage = async (messageId: string) => {
	return tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: messageId,
	})
}
