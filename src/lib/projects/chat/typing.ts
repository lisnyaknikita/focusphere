import { db } from '@/lib/appwrite'
import { Permission, Role } from 'appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TYPING_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_TYPING_INDICATORS!

export interface TypingPayload {
	channelId: string
	userId: string
	userName: string
	isTyping: boolean
	teamId?: string
}

const getTypingRowId = (channelId: string, userId: string): string => {
	const str = `${channelId}_${userId}`
	let h1 = 0x811c9dc5
	let h2 = 0x01000193
	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i)
		h1 = Math.imul(h1 ^ code, 16777619)
		h2 = Math.imul(h2 ^ code, 314159265)
	}
	let h3 = 0x811c9dc5
	let h4 = 0x01000193
	for (let i = str.length - 1; i >= 0; i--) {
		const code = str.charCodeAt(i)
		h3 = Math.imul(h3 ^ code, 271828182)
		h4 = Math.imul(h4 ^ code, 161803398)
	}
	const p1 = (h1 >>> 0).toString(16).padStart(8, '0')
	const p2 = (h2 >>> 0).toString(16).padStart(8, '0')
	const p3 = (h3 >>> 0).toString(16).padStart(8, '0')
	const p4 = (h4 >>> 0).toString(16).padStart(8, '0')
	return `t_${p1}${p2}${p3}${p4}`.slice(0, 32)
}

export const setTypingStatus = async (payload: TypingPayload) => {
	const rowId = getTypingRowId(payload.channelId, payload.userId)

	const readPermission = payload.teamId ? Permission.read(Role.team(payload.teamId)) : Permission.read(Role.users())

	const permissions = [
		readPermission,
		Permission.update(Role.user(payload.userId)),
		Permission.delete(Role.user(payload.userId)),
	]

	const data = {
		channelId: payload.channelId,
		userId: payload.userId,
		userName: payload.userName,
		isTyping: payload.isTyping,
	}

	try {
		await db.updateRow({
			databaseId: DB_ID,
			tableId: TYPING_TABLE,
			rowId,
			data,
		})
	} catch {
		try {
			await db.createRow({
				databaseId: DB_ID,
				tableId: TYPING_TABLE,
				rowId,
				data,
				permissions,
			})
		} catch (err) {
			console.error('Failed to create typing status row:', err)
		}
	}
}
