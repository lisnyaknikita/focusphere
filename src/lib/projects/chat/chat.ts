import { db, teams } from '@/lib/appwrite'
import { CreateChannelPayload, CreateMessagePayload } from '@/shared/types/chat'
import { ID, Permission, Query, Role } from 'appwrite'

const CHANNELS_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_CHANNELS!
const MESSAGES_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_MESSAGES!

export const getTeamMembers = async (teamId: string) => {
	return await teams.listMemberships(teamId)
}

export const getChannels = async (projectId: string) => {
	return db.listRows({
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
		permissions.push(Permission.delete(Role.team(payload.teamId)))
	}

	const { ...data } = payload

	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		rowId: ID.unique(),
		data,
		permissions,
	})
}

export const updateChannel = async (channelId: string, name: string) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: CHANNELS_TABLE,
		rowId: channelId,
		data: { name },
	})
}

export const deleteChannel = async (channelId: string) => {
	try {
		const messages = await db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: MESSAGES_TABLE,
			queries: [Query.equal('channelId', channelId), Query.limit(1000)],
		})

		if (messages.total > 0) {
			await Promise.all(
				messages.rows.map(message =>
					db.deleteRow({
						databaseId: process.env.NEXT_PUBLIC_DB_ID!,
						tableId: MESSAGES_TABLE,
						rowId: message.$id,
					})
				)
			)
			console.log(`Deleted ${messages.total} messages from channel ${channelId}`)
		}

		return db.deleteRow({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: CHANNELS_TABLE,
			rowId: channelId,
		})
	} catch (error) {
		console.error('Error during channel cascading delete:', error)
		throw error
	}
}

export const getMessages = async (channelId: string) => {
	return db.listRows({
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
		permissions.push(Permission.delete(Role.team(teamId)))
	}

	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: ID.unique(),
		data: {
			...payload,
			isEdited: false,
		},
		permissions,
	})
}

export const updateMessage = async (messageId: string, content: string) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: messageId,
		data: {
			content,
			isEdited: true,
		},
	})
}

export const deleteMessage = async (messageId: string) => {
	return db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: MESSAGES_TABLE,
		rowId: messageId,
	})
}

export const updateLegacyNames = async (userId: string, newName: string) => {
	try {
		const messages = db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: MESSAGES_TABLE,
			queries: [Query.equal('senderId', userId), Query.limit(100)],
		})

		const promises = (await messages).rows.map(message =>
			db.updateRow({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: MESSAGES_TABLE,
				rowId: message.$id,
				data: { senderName: newName },
			})
		)

		await Promise.all(promises)
		console.log('All legacy messages updated!')
	} catch (err) {
		console.error('Migration failed:', err)
	}
}
