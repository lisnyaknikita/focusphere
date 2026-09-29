import { DailyTasksCountByDateContext } from '@/app/(main)/calendar/components/main/calendar/daily-tasks-count-context'
import { CalendarCopyModeContext } from '@/features/calendar/calendar-copy-mode-context'
import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { useCalendarCopyPaste } from '@/shared/hooks/calendar/use-calendar-copypaste'
import { useCalendarModals } from '@/shared/hooks/calendar/use-calendar-modals'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calendar-mutations'
import { useCalendarScroll } from '@/shared/hooks/calendar/use-calendar-scroll'
import { useDailyTasksCounters } from '@/shared/hooks/calendar/use-daily-tasks-counters'
import { InitialEventValues } from '@/shared/hooks/calendar/use-event-form'
import { useGridDragCreate } from '@/shared/hooks/calendar/use-grid-drag-create'
import { useMonthMorePopover } from '@/shared/hooks/calendar/use-month-more-popover'
import { useScheduleXBridge } from '@/shared/hooks/calendar/use-schedulex-bridge'
import { useCalendarEvents } from '@/shared/hooks/events/use-calendar-events'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { ScheduleXCalendar } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarView } from '../../../constants/calendar.constants'
import classes from './calendar.module.scss'
import { CalendarOverlays } from './components/calendar-overlays/calendar-overlays'

interface CalendarInnerProps {
	view: CalendarView
	onRequestCreate: (values: InitialEventValues) => void
	onDayClick: (date: string) => void
	onGoogleLoadingChange?: (loading: boolean) => void
}

const defaultRange = () => {
	const now = new Date()
	const start = new Date(now)
	start.setDate(now.getDate() - 7)
	const end = new Date(now)
	end.setDate(now.getDate() + 35)
	return { start: start.toISOString(), end: end.toISOString() }
}

export const CalendarInner = memo(
	({ view, onRequestCreate, onDayClick, onGoogleLoadingChange }: CalendarInnerProps) => {
		const { user } = useUser()
		const { isPro, openPaywall } = useBilling()

		const [range, setRange] = useState(defaultRange)

		const calendarWrapperRef = useRef<HTMLDivElement>(null)
		const isFirstRender = useRef(true)

		const { events, isGoogleLoading } = useCalendarEvents({
			userId: user?.$id,
			start: range.start,
			end: range.end,
			view,
		})
		const { dailyTasksCountByDate } = useDailyTasksCounters({ userId: user?.$id, start: range.start, end: range.end })
		const { handleCreateEvent } = useCalendarMutations()

		const quickCreate = useCallback(
			(dateTime: Temporal.ZonedDateTime) => {
				const roundedMinutes = Math.round(dateTime.minute / 15) * 15
				const start = dateTime.add({ minutes: roundedMinutes - dateTime.minute })
				const end = start.add({ minutes: 30 })
				const formatTime = (dt: Temporal.ZonedDateTime) =>
					`${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}`

				onRequestCreate({
					date: start.toPlainDate().toString(),
					startTime: formatTime(start),
					endTime: formatTime(end),
				})
			},
			[onRequestCreate]
		)

		const { copiedEvent, setCopiedEvent, handleDateClick, isCopyMode } = useCalendarCopyPaste({
			user,
			quickCreate,
			handleCreateEvent,
		})

		const { popoverState, closePopover } = useMonthMorePopover(calendarWrapperRef)

		const onRangeUpdate = useCallback((nextRange: { start: { toString(): string }; end: { toString(): string } }) => {
			setRange({
				start: `${nextRange.start.toString().slice(0, 10)}T00:00:00.000Z`,
				end: `${nextRange.end.toString().slice(0, 10)}T23:59:59.999Z`,
			})
		}, [])

		const { calendar, eventsService, setView, eventModal } = useCalendarApp({
			defaultView: view,
			onQuickCreate: quickCreate,
			onDateClick: handleDateClick,
			onRangeUpdate,
		})

		const {
			selectedEventForModal,
			setSelectedEventForModal,
			eventToDelete,
			setEventToDelete,
			handleConfirmDelete,
			handleRecurrenceDelete,
			renderEventInfoModal,
		} = useCalendarModals({
			eventsService,
			eventModal,
			setCopiedEvent,
		})

		const { customComponents } = useScheduleXBridge({
			isCopyMode,
			handleDateClick,
			onDayClick,
			renderEventInfoModal,
			eventModal,
		})

		const { selectionInfo } = useGridDragCreate({
			isPro,
			timeBlocksCount: events.filter(e => e.source !== 'google').length,
			openPaywall,
			onRequestCreateModal: onRequestCreate,
		})

		useCalendarScroll({ dependencies: [view] })

		const mappedEvents = useMemo(() => events.map(mapEventToScheduleX), [events])

		useEffect(() => {
			eventsService.set(mappedEvents)
		}, [mappedEvents, eventsService])

		useEffect(() => onGoogleLoadingChange?.(isGoogleLoading), [isGoogleLoading, onGoogleLoadingChange])

		useEffect(() => {
			if (isFirstRender.current) {
				isFirstRender.current = false
				return
			}
			setView(view)
		}, [view, setView])

		return (
			<DailyTasksCountByDateContext.Provider value={dailyTasksCountByDate}>
				<CalendarCopyModeContext.Provider value={isCopyMode}>
					<div className={classes.calendarWrapper} ref={calendarWrapperRef}>
						<ScheduleXCalendar key={view} customComponents={customComponents} calendarApp={calendar} />
					</div>

					<CalendarOverlays
						copiedEvent={copiedEvent}
						setCopiedEvent={setCopiedEvent}
						selectionInfo={selectionInfo}
						popoverState={popoverState}
						closePopover={closePopover}
						mappedEvents={mappedEvents}
						selectedEventForModal={selectedEventForModal}
						setSelectedEventForModal={setSelectedEventForModal}
						eventToDelete={eventToDelete}
						setEventToDelete={setEventToDelete}
						renderEventInfoModal={renderEventInfoModal}
						handleConfirmDelete={handleConfirmDelete}
						handleRecurrenceDelete={handleRecurrenceDelete}
					/>
				</CalendarCopyModeContext.Provider>
			</DailyTasksCountByDateContext.Provider>
		)
	}
)

CalendarInner.displayName = 'CalendarInner'
