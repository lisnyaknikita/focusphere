import { db } from '@/lib/appwrite'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useCallback } from 'react'
import 'temporal-polyfill/global'

const mapGoogleEvent = (gEvent: GoogleCalendarEvent, userId: string): CalendarEvent => {
	const isAllDay = !!gEvent.start?.date
	let startDate = gEvent.start?.dateTime || ''
	let endDate = gEvent.end?.dateTime || ''

	if (isAllDay && gEvent.end?.date) {
		startDate = gEvent.start.date!
		try {
			const endPlainDate = Temporal.PlainDate.from(gEvent.end.date).subtract({ days: 1 })
			const startPlainDate = Temporal.PlainDate.from(startDate)
			endDate = Temporal.PlainDate.compare(endPlainDate, startPlainDate) >= 0 ? endPlainDate.toString() : startDate
		} catch {
			const endObj = new Date(gEvent.end.date)
			endObj.setDate(endObj.getDate() - 1)
			endDate = endObj.toISOString().split('T')[0]
		}
	}

	const reverseColorMap: Record<string, string> = {
		'5': '#D79716',
		'11': '#D71616',
		'10': '#17720F',
		'9': '#1351AE',
		'3': '#97107A',
		'7': '#16ADD7',
	}

	return {
		$id: `g_${gEvent.id}`,
		$createdAt: new Date().toISOString(),
		$updatedAt: new Date().toISOString(),
		$collectionId: '',
		$databaseId: '',
		$permissions: [],
		$sequence: 0,
		title: gEvent.summary || 'Google Event',
		description: gEvent.description || '',
		startDate,
		endDate,
		color: gEvent.colorId ? reverseColorMap[gEvent.colorId] || '#4285F4' : '#4285F4',
		calendarId: 'google-calendar',
		userId,
		source: 'google',
		googleEventId: gEvent.id,
		syncStatus: 'synced',
	} as unknown as CalendarEvent
}

const fetchAppwriteEvents = async (): Promise<CalendarEvent[]> => {
	const userId = await getCurrentUserId()

	const twoMonthsAgo = new Date()
	twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

	const filters = [
		Query.equal('userId', userId),
		Query.greaterThanEqual('startDate', twoMonthsAgo.toISOString()),
		Query.limit(300),
	]

	const appwriteRes = await db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		queries: filters,
	})

	return appwriteRes.rows as unknown as CalendarEvent[]
}

const fetchGoogleEvents = async (): Promise<CalendarEvent[]> => {
	const userId = await getCurrentUserId()
	const timeMin = new Date()
	timeMin.setMonth(timeMin.getMonth() - 2)
	const timeMax = new Date()
	timeMax.setMonth(timeMax.getMonth() + 3)

	try {
		const googleEventsRaw = await googleCalendarService.fetchEvents(timeMin, timeMax)
		return googleEventsRaw.map(gEvent => mapGoogleEvent(gEvent, userId))
	} catch (googleError) {
		console.error('Google Calendar sync error:', googleError)
		return []
	}
}

export const useEvents = () => {
	const queryClient = useQueryClient()

	const { data: appwriteEvents = [], isLoading: isAppwriteLoading } = useQuery({
		queryKey: ['events-appwrite'],
		queryFn: fetchAppwriteEvents,
		staleTime: 1000 * 60 * 5,
	})

	const { data: googleEvents = [], isFetching: isGoogleLoading } = useQuery({
		queryKey: ['events-google'],
		queryFn: fetchGoogleEvents,
		staleTime: 1000 * 60 * 5,
	})

	const events = [...appwriteEvents, ...googleEvents]

	const getEvents = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ['events-appwrite'] }),
			queryClient.invalidateQueries({ queryKey: ['events-google'] }),
		])
	}, [queryClient])

	return {
		events,
		getEvents,
		isLoading: isAppwriteLoading,
		isGoogleLoading,
	}
}
