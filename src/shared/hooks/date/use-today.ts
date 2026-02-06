'use client'

import { useEffect, useState } from 'react'
import 'temporal-polyfill/global'

interface TodayData {
	plainDate: Temporal.PlainDate
	iso: string
	day: number
	weekday: string
	month: string
}

export const useToday = () => {
	const [todayData, setTodayData] = useState<TodayData | null>(null)

	useEffect(() => {
		const today = Temporal.Now.plainDateISO()

		setTodayData({
			plainDate: today,
			iso: today.toString(),
			day: today.day,
			weekday: today.toLocaleString('en-US', { weekday: 'long' }),
			month: today.toLocaleString('en-US', { month: 'long' }),
		})
	}, [])

	return todayData
}
