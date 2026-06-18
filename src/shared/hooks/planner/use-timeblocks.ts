import { db } from '@/lib/appwrite'
import { getCalendarIdByColor } from '@/lib/events/calendar-config'
import { createTimeBlock, deleteTimeBlock } from '@/lib/planner/planner'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { TimeBlock } from '@/shared/types/time-block'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { Query } from 'appwrite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export const useTimeBlocks = (user: CustomUser | null) => {
	const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [copiedTimeBlock, setCopiedTimeBlock] = useState<SXEvent | null>(null)

	const userId = user?.$id

	const copiedTimeBlockRef = useRef<SXEvent | null>(null)
	const isCreatingRef = useRef(false)

	useEffect(() => {
		copiedTimeBlockRef.current = copiedTimeBlock
	}, [copiedTimeBlock])

	const getTimeBlocks = useCallback(async () => {
		try {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
				queries: [Query.equal('userId', userId), Query.limit(5000)],
			})

			setTimeBlocks(response.rows as unknown as TimeBlock[])
		} catch (error) {
			console.error('Error fetching time blocks:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const pasteTimeBlock = useCallback(
		async (date: string) => {
			const copiedEvent = copiedTimeBlockRef.current
			if (!copiedEvent || !userId) return

			try {
				const startStr = copiedEvent.start.toString()
				const endStr = copiedEvent.end.toString()

				const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
				const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'

				const newStartDate = `${date}T${startTime}:00`
				const newEndDate = `${date}T${endTime}:00`

				await createTimeBlock({
					title: copiedEvent.title!,
					startDate: newStartDate,
					endDate: newEndDate,
					color: copiedEvent.color,
					calendarId: getCalendarIdByColor(copiedEvent.color),
					userId,
				})

				await getTimeBlocks()
				setCopiedTimeBlock(null)
			} catch (error) {
				console.error('Failed to paste time block:', error)
				toast.error('Failed to paste time block')
			}
		},
		[userId, getTimeBlocks]
	)

	const cleanupOldTimeBlocks = useCallback(async () => {
		const lastCleanup = localStorage.getItem('last_timeblocks_cleanup')
		const today = new Date().toISOString().split('T')[0]

		if (lastCleanup === today) return

		try {
			const userId = await getCurrentUserId()

			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

			const thresholdDate = thirtyDaysAgo.toISOString()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
				queries: [
					Query.equal('userId', userId),
					Query.lessThan('startDate', thresholdDate),
					Query.limit(100),
					Query.select(['$id']),
				],
			})

			if (response.rows.length > 0) {
				await Promise.allSettled(response.rows.map(block => deleteTimeBlock(block.$id)))
				console.log(`[TimeBlocks Cleanup] TimeBlocks deleted: ${response.rows.length}`)
			}

			localStorage.setItem('last_timeblocks_cleanup', today)
		} catch (error) {
			console.error('[TimeBlocks Cleanup] Error:', error)
		}
	}, [])

	const createQuickBlock = useCallback(
		async (dateTime: Temporal.ZonedDateTime) => {
			if (!userId) return null
			if (isCreatingRef.current) return null

			isCreatingRef.current = true
			try {
				const roundedMinutes = Math.round(dateTime.minute / 15) * 15

				const startZoned = dateTime.with({ minute: 0, second: 0, millisecond: 0 }).add({ minutes: roundedMinutes })

				const endZoned = startZoned.add({ minutes: 30 })

				const start = startZoned.toInstant().toString()
				const end = endZoned.toInstant().toString()

				const created = await createTimeBlock({
					title: 'New Block',
					startDate: start,
					endDate: end,
					color: 'blue',
					calendarId: getCalendarIdByColor('blue'),
					userId,
				})

				await getTimeBlocks()

				const toZDT = (iso: string) => Temporal.Instant.from(iso).toZonedDateTimeISO('UTC')

				return {
					id: created.$id,
					title: 'New Block',
					start: toZDT(start),
					end: toZDT(end),
					color: 'blue',
					calendarId: getCalendarIdByColor('blue'),
				}
			} catch (error) {
				console.error('Failed to create quick block:', error)
				toast.error('Failed to create quick time block')
				return null
			} finally {
				isCreatingRef.current = false
			}
		},
		[userId, getTimeBlocks]
	)

	useEffect(() => {
		cleanupOldTimeBlocks()
	}, [cleanupOldTimeBlocks])

	useEffect(() => {
		getTimeBlocks()
	}, [getTimeBlocks])

	return {
		timeBlocks,
		copiedTimeBlock,
		setCopiedTimeBlock,
		isLoading,
		refreshTimeBlocks: getTimeBlocks,
		pasteTimeBlock,
		createQuickBlock,
	}
}
