import { FocusSessionRow } from '@/shared/types/focus-sessions'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_FOCUS_SESSIONS!

export const FOCUS_SESSION_RECORDED_EVENT = 'focus-session-recorded'

export const recordFocusSession = async (userId: string, durationMinutes: number): Promise<FocusSessionRow | null> => {
	if (!userId || durationMinutes <= 0 || !TABLE_ID) return null

	try {
		const response = await db.createRow({
			databaseId: DB_ID,
			tableId: TABLE_ID,
			rowId: ID.unique(),
			data: {
				userId,
				durationMinutes,
				completedAt: new Date().toISOString(),
			},
		})

		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(FOCUS_SESSION_RECORDED_EVENT))
		}

		return response as unknown as FocusSessionRow
	} catch (error) {
		console.error('Failed to record focus session:', error)
		return null
	}
}

export const getFocusSessionsByDateRange = async (
	userId: string,
	startDate: Date,
	endDate: Date
): Promise<FocusSessionRow[]> => {
	if (!userId || !TABLE_ID) return []

	try {
		const response = await db.listRows({
			databaseId: DB_ID,
			tableId: TABLE_ID,
			queries: [
				Query.equal('userId', userId),
				Query.greaterThanEqual('completedAt', startDate.toISOString()),
				Query.lessThanEqual('completedAt', endDate.toISOString()),
				Query.orderAsc('completedAt'),
			],
		})

		return response.rows as unknown as FocusSessionRow[]
	} catch (error) {
		console.error('Failed to fetch focus sessions:', error)
		return []
	}
}
