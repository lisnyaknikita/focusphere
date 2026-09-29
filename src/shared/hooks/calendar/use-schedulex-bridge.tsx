import { MonthDayHeader } from '@/app/(main)/calendar/components/main/calendar/components/month-day-header/month-day-header'
import { WeekDayHeader } from '@/app/(main)/planner/components/main/planner-inner/components/week-day-header/week-day-header'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import type { createEventModalPlugin } from '@schedule-x/event-modal'
import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { Temporal } from 'temporal-polyfill'

interface UseScheduleXBridgeProps {
	isCopyMode: boolean
	handleDateClick: (date: Temporal.PlainDate) => void
	onDayClick: (date: string) => void
	renderEventInfoModal: (event: SXEvent, onCloseModal?: () => void) => ReactNode
	eventModal: ReturnType<typeof createEventModalPlugin>
}

export const useScheduleXBridge = ({
	isCopyMode,
	handleDateClick,
	onDayClick,
	renderEventInfoModal,
	eventModal,
}: UseScheduleXBridgeProps) => {
	const isCopyModeRef = useRef(isCopyMode)
	isCopyModeRef.current = isCopyMode

	const handleDateClickRef = useRef(handleDateClick)
	handleDateClickRef.current = handleDateClick

	const onDayClickRef = useRef(onDayClick)
	onDayClickRef.current = onDayClick

	const renderEventInfoModalRef = useRef(renderEventInfoModal)
	renderEventInfoModalRef.current = renderEventInfoModal

	const eventModalRef = useRef(eventModal)
	eventModalRef.current = eventModal

	const handleHeaderDayClick = useCallback((selectedDate: string) => {
		if (isCopyModeRef.current) {
			handleDateClickRef.current(Temporal.PlainDate.from(selectedDate))
		} else {
			onDayClickRef.current(selectedDate)
		}
	}, [])

	const customComponents = useMemo(
		() => ({
			eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) =>
				renderEventInfoModalRef.current(calendarEvent, () => eventModalRef.current.close()),
			weekGridDate: ({ date }: { date: string }) => <WeekDayHeader date={date} onDayClick={handleHeaderDayClick} />,
			monthGridDate: ({ date, jsDate }: { date: number; jsDate: Date }) => (
				<MonthDayHeader date={date} jsDate={jsDate} onDayClick={handleHeaderDayClick} />
			),
		}),
		[handleHeaderDayClick]
	)

	return { customComponents }
}
