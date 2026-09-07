import { FOCUS_SESSION_RECORDED_EVENT, getFocusSessionsByDateRange } from '@/lib/focus/stats'
import { FocusSessionRow } from '@/shared/types/focus-sessions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface DayStat {
	dayName: string
	shortDate: string
	fullDate: Date
	totalMinutes: number
	sessionCount: number
	isToday: boolean
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const getStartOfWeek = (d: Date): Date => {
	const date = new Date(d)
	const day = date.getDay()
	const diff = date.getDate() - day + (day === 0 ? -6 : 1)
	date.setDate(diff)
	date.setHours(0, 0, 0, 0)
	return date
}

export const formatMinutesToHours = (minutes: number): string => {
	if (minutes <= 0) return '0m'
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	if (hours === 0) return `${mins}m`
	if (mins === 0) return `${hours}h`
	return `${hours}h ${mins}m`
}

export const useTimerStats = (userId: string | null | undefined) => {
	const queryClient = useQueryClient()
	const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getStartOfWeek(new Date()))

	const weekRange = useMemo(() => {
		const start = new Date(currentWeekStart)
		const end = new Date(currentWeekStart)
		end.setDate(start.getDate() + 6)
		end.setHours(23, 59, 59, 999)
		return { start, end }
	}, [currentWeekStart])

	const isCurrentWeek = useMemo(() => {
		const nowStart = getStartOfWeek(new Date())
		return currentWeekStart.getTime() === nowStart.getTime()
	}, [currentWeekStart])

	const {
		data: sessions = [],
		isLoading,
		refetch,
	} = useQuery<FocusSessionRow[]>({
		queryKey: ['focus-sessions', userId, weekRange.start.toISOString()],
		queryFn: () => getFocusSessionsByDateRange(userId!, weekRange.start, weekRange.end),
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	})

	useEffect(() => {
		const handleSessionRecorded = () => {
			queryClient.invalidateQueries({ queryKey: ['focus-sessions', userId] })
		}

		window.addEventListener(FOCUS_SESSION_RECORDED_EVENT, handleSessionRecorded)
		return () => window.removeEventListener(FOCUS_SESSION_RECORDED_EVENT, handleSessionRecorded)
	}, [userId, queryClient])

	const goToPreviousWeek = useCallback(() => {
		setCurrentWeekStart(prev => {
			const next = new Date(prev)
			next.setDate(next.getDate() - 7)
			return next
		})
	}, [])

	const goToNextWeek = useCallback(() => {
		setCurrentWeekStart(prev => {
			const next = new Date(prev)
			next.setDate(next.getDate() + 7)
			return next
		})
	}, [])

	const dailyStats = useMemo<DayStat[]>(() => {
		const sessionsByDate = new Map<string, FocusSessionRow[]>()
		for (const session of sessions) {
			const dateKey = new Date(session.completedAt).toDateString()
			const existing = sessionsByDate.get(dateKey)
			if (existing) {
				existing.push(session)
			} else {
				sessionsByDate.set(dateKey, [session])
			}
		}

		const days: DayStat[] = []
		const todayStr = new Date().toDateString()

		for (let i = 0; i < 7; i++) {
			const dayDate = new Date(weekRange.start)
			dayDate.setDate(weekRange.start.getDate() + i)

			const daySessions = sessionsByDate.get(dayDate.toDateString()) || []
			const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
			const monthDay = dayDate.getDate()
			const monthShort = MONTH_NAMES[dayDate.getMonth()]

			days.push({
				dayName: DAY_LABELS[i],
				shortDate: `${monthShort} ${monthDay}`,
				fullDate: dayDate,
				totalMinutes,
				sessionCount: daySessions.length,
				isToday: dayDate.toDateString() === todayStr,
			})
		}

		return days
	}, [weekRange.start, sessions])

	const totalMinutes = useMemo(() => {
		return dailyStats.reduce((acc, d) => acc + d.totalMinutes, 0)
	}, [dailyStats])

	const totalSessions = useMemo(() => {
		return dailyStats.reduce((acc, d) => acc + d.sessionCount, 0)
	}, [dailyStats])

	const dailyAverageMinutes = useMemo(() => {
		return Math.round(totalMinutes / 7)
	}, [totalMinutes])

	const maxDailyMinutes = useMemo(() => {
		const max = Math.max(...dailyStats.map(d => d.totalMinutes), 0)
		return max > 0 ? max : 60
	}, [dailyStats])

	const dateRangeLabel = useMemo(() => {
		const startMonth = MONTH_NAMES[weekRange.start.getMonth()]
		const startDay = weekRange.start.getDate()
		const endMonth = MONTH_NAMES[weekRange.end.getMonth()]
		const endDay = weekRange.end.getDate()
		const year = weekRange.start.getFullYear()

		if (startMonth === endMonth) {
			return `${startMonth} ${startDay} – ${endDay}, ${year}`
		}
		return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
	}, [weekRange])

	return {
		currentWeekStart,
		isCurrentWeek,
		dateRangeLabel,
		isLoading: isLoading || !userId,
		dailyStats,
		totalMinutes,
		formattedTotalTime: formatMinutesToHours(totalMinutes),
		totalSessions,
		dailyAverageMinutes,
		formattedDailyAverage: formatMinutesToHours(dailyAverageMinutes),
		maxDailyMinutes,
		goToPreviousWeek,
		goToNextWeek,
		refetchStats: refetch,
	}
}
