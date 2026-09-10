'use client'

import { mapEventToScheduleX, mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useGridDragCreate } from '@/shared/hooks/planner/use-grid-drag-create'
import { usePlannerCalendar } from '@/shared/hooks/planner/use-planner-calendar'
import { InitialTimeBlockValues } from '@/shared/hooks/planner/use-timeblock-form'
import { CalendarEvent } from '@/shared/types/event'
import { TimeBlock } from '@/shared/types/time-block'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useEffect } from 'react'
import { PlannerInner } from '../planner-inner/planner-inner'

interface PlannerCalendarSectionProps {
	timeBlocks: TimeBlock[]
	calendarEvents: CalendarEvent[]
	showCalendarEvents: boolean
	onDayClick: (date: string) => void
	onCopyEvent: (event: SXEvent) => void
	refreshTimeBlocks: () => void
	onRequestCreateTimeBlock: (initialValues: InitialTimeBlockValues) => void
}

export const PlannerCalendarSection = ({
	timeBlocks,
	calendarEvents,
	showCalendarEvents,
	onDayClick,
	onCopyEvent,
	refreshTimeBlocks,
	onRequestCreateTimeBlock,
}: PlannerCalendarSectionProps) => {
	const { isPro, openPaywall } = useBilling()

	const { calendar, eventsService, eventModal } = usePlannerCalendar({
		isPro,
		timeBlocks,
		openPaywall,
		onRequestCreateModal: onRequestCreateTimeBlock,
	})

	const { selectionInfo } = useGridDragCreate({
		isPro,
		timeBlocksCount: timeBlocks.length,
		openPaywall,
		onRequestCreateModal: onRequestCreateTimeBlock,
	})

	useEffect(() => {
		if (!eventsService) return
		const mappedBlocks = timeBlocks.map(mapTimeBlockToScheduleX)
		const mappedCalendarEvents = showCalendarEvents ? calendarEvents.map(mapEventToScheduleX) : []
		eventsService.set([...mappedBlocks, ...mappedCalendarEvents])
	}, [timeBlocks, calendarEvents, showCalendarEvents, eventsService])

	return (
		<PlannerInner
			timeBlocks={timeBlocks}
			calendar={calendar}
			eventsService={eventsService}
			eventModal={eventModal}
			onDayClick={onDayClick}
			onCopyEvent={onCopyEvent}
			refreshTimeBlocks={refreshTimeBlocks}
			selectionInfo={selectionInfo}
		/>
	)
}
