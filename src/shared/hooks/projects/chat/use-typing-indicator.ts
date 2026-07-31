'use client'

import { client } from '@/lib/appwrite'
import { setTypingStatus } from '@/lib/projects/chat/typing'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TYPING_TABLE = process.env.NEXT_PUBLIC_TABLE_PROJECT_TYPING_INDICATORS!

export interface ActiveTyper {
	userId: string
	userName: string
	expiresAt: number
}

interface TypingRealtimePayload {
	$id: string
	channelId: string
	userId: string
	userName: string
	isTyping: boolean
}

export const useTypingIndicator = (
	channelId?: string,
	currentUserId?: string,
	currentUserName?: string,
	teamId?: string
) => {
	const [typersMap, setTypersMap] = useState<Map<string, ActiveTyper>>(new Map())

	const lastSentRef = useRef<number>(0)
	const stopTimerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		setTypersMap(new Map())

		return () => {
			if (stopTimerRef.current) {
				clearTimeout(stopTimerRef.current)
				stopTimerRef.current = null
			}
		}
	}, [channelId])

	const notifyTyping = useCallback(() => {
		if (!channelId || !currentUserId) return

		const effectiveName = currentUserName || 'Teammate'
		const now = Date.now()

		if (stopTimerRef.current) {
			clearTimeout(stopTimerRef.current)
		}

		if (now - lastSentRef.current > 2500) {
			lastSentRef.current = now
			setTypingStatus({
				channelId,
				userId: currentUserId,
				userName: effectiveName,
				isTyping: true,
				teamId,
			}).catch(err => console.error('Typing status update failed:', err))
		}

		stopTimerRef.current = setTimeout(() => {
			lastSentRef.current = 0
			setTypingStatus({
				channelId,
				userId: currentUserId,
				userName: effectiveName,
				isTyping: false,
				teamId,
			}).catch(err => console.error('Stop typing update failed:', err))
		}, 3000)
	}, [channelId, currentUserId, currentUserName, teamId])

	const notifyStopTyping = useCallback(() => {
		if (!channelId || !currentUserId) return

		const effectiveName = currentUserName || 'Teammate'

		if (stopTimerRef.current) {
			clearTimeout(stopTimerRef.current)
			stopTimerRef.current = null
		}

		lastSentRef.current = 0
		setTypingStatus({
			channelId,
			userId: currentUserId,
			userName: effectiveName,
			isTyping: false,
			teamId,
		}).catch(err => console.error('Stop typing update failed:', err))
	}, [channelId, currentUserId, currentUserName, teamId])

	useEffect(() => {
		if (!channelId || !currentUserId || !DB_ID || !TYPING_TABLE) return

		const unsubscribe = client.subscribe(`databases.${DB_ID}.collections.${TYPING_TABLE}.documents`, response => {
			const payload = response.payload as unknown as TypingRealtimePayload

			if (payload.channelId !== channelId) return
			if (payload.userId === currentUserId) return

			setTypersMap(prev => {
				const next = new Map(prev)
				if (payload.isTyping) {
					next.set(payload.userId, {
						userId: payload.userId,
						userName: payload.userName,
						expiresAt: Date.now() + 4000,
					})
				} else {
					next.delete(payload.userId)
				}
				return next
			})
		})

		return () => {
			unsubscribe()
		}
	}, [channelId, currentUserId])

	useEffect(() => {
		if (typersMap.size === 0) return

		const interval = setInterval(() => {
			const now = Date.now()
			setTypersMap(prev => {
				let hasExpired = false
				const next = new Map(prev)

				for (const [id, typer] of next.entries()) {
					if (now > typer.expiresAt) {
						next.delete(id)
						hasExpired = true
					}
				}

				return hasExpired ? next : prev
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [typersMap.size > 0])

	const typers = useMemo(() => Array.from(typersMap.values()), [typersMap])

	return {
		typers,
		notifyTyping,
		notifyStopTyping,
	}
}
