import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { InitialTimeBlockValues } from '@/shared/hooks/planner/use-timeblock-form'
import { TimeBlock } from '@/shared/types/time-block'
import { useCallback, useEffect, useRef } from 'react'

interface UsePlannerCalendarProps {
	isPro: boolean
	timeBlocks: TimeBlock[]
	openPaywall: (id: string) => void
	onRequestCreateModal: (initialValues: InitialTimeBlockValues) => void
}

export const usePlannerCalendar = ({
	isPro,
	timeBlocks,
	openPaywall,
	onRequestCreateModal,
}: UsePlannerCalendarProps) => {
	const isProRef = useRef(isPro)
	const timeBlocksRef = useRef(timeBlocks)
	const openPaywallRef = useRef(openPaywall)
	const onRequestCreateModalRef = useRef(onRequestCreateModal)

	useEffect(() => {
		isProRef.current = isPro
		timeBlocksRef.current = timeBlocks
		openPaywallRef.current = openPaywall
		onRequestCreateModalRef.current = onRequestCreateModal
	}, [isPro, timeBlocks, openPaywall, onRequestCreateModal])

	const handleQuickCreate = useCallback((dateTime: Temporal.ZonedDateTime) => {
		if (!isProRef.current && timeBlocksRef.current.length >= 50) {
			openPaywallRef.current('planner_blocks_unlimited')
			return
		}

		const roundedMinutes = Math.round(dateTime.minute / 15) * 15
		const startZoned = dateTime.with({ minute: 0, second: 0, millisecond: 0 }).add({ minutes: roundedMinutes })
		const endZoned = startZoned.add({ minutes: 30 })

		const yyyy = String(startZoned.year).padStart(4, '0')
		const mm = String(startZoned.month).padStart(2, '0')
		const dd = String(startZoned.day).padStart(2, '0')
		const dateStr = `${yyyy}-${mm}-${dd}`

		const startStr = `${String(startZoned.hour).padStart(2, '0')}:${String(startZoned.minute).padStart(2, '0')}`
		const endStr = `${String(endZoned.hour).padStart(2, '0')}:${String(endZoned.minute).padStart(2, '0')}`

		onRequestCreateModalRef.current({
			date: dateStr,
			startTime: startStr,
			endTime: endStr,
		})
	}, [])

	const calendarData = useCalendarApp({
		onQuickCreate: handleQuickCreate,
	})

	return calendarData
}
