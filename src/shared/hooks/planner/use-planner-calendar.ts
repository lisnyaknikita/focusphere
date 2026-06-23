import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { TimeBlock } from '@/shared/types/time-block'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useCallback, useEffect, useRef } from 'react'

interface UsePlannerCalendarProps {
	isPro: boolean
	timeBlocks: TimeBlock[]
	openPaywall: (id: string) => void
	createQuickBlock: (dateTime: Temporal.ZonedDateTime) => Promise<SXEvent | null>
	onQuickBlockCreated: (event: SXEvent) => void
}

export const usePlannerCalendar = ({
	isPro,
	timeBlocks,
	openPaywall,
	createQuickBlock,
	onQuickBlockCreated,
}: UsePlannerCalendarProps) => {
	const isProRef = useRef(isPro)
	const timeBlocksRef = useRef(timeBlocks)
	const openPaywallRef = useRef(openPaywall)
	const createQuickBlockRef = useRef(createQuickBlock)
	const onQuickBlockCreatedRef = useRef(onQuickBlockCreated)

	useEffect(() => {
		isProRef.current = isPro
		timeBlocksRef.current = timeBlocks
		openPaywallRef.current = openPaywall
		createQuickBlockRef.current = createQuickBlock
		onQuickBlockCreatedRef.current = onQuickBlockCreated
	}, [isPro, timeBlocks, openPaywall, createQuickBlock, onQuickBlockCreated])

	const handleQuickCreate = useCallback(async (dateTime: Temporal.ZonedDateTime) => {
		if (!isProRef.current && timeBlocksRef.current.length >= 50) {
			openPaywallRef.current('planner_blocks_unlimited')
			return
		}

		const event = await createQuickBlockRef.current(dateTime)
		if (event) {
			onQuickBlockCreatedRef.current(event)
		}
	}, [])

	const calendarData = useCalendarApp({
		onQuickCreate: handleQuickCreate,
	})

	return calendarData
}
