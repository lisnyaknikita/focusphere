import { WeekDayHeader } from '@/app/(main)/planner/components/main/planner-inner/components/week-day-header/week-day-header'
import { DailyTasksCountByDateContext } from '@/app/(main)/planner/daily-tasks-count-context'
import { CalendarCopyModeContext } from '@/features/calendar/calendar-copy-mode-context'
import { EventPasteBanner } from '@/features/calendar/event-paste-banner'
import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calnedar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { InitialEventValues } from '@/shared/hooks/calendar/use-event-form'
import { useMonthMorePopover } from '@/shared/hooks/calendar/use-month-more-popover'
import { useCalendarEvents } from '@/shared/hooks/events/use-calendar-events'
import { useCalendarScroll } from '@/shared/hooks/planner/use-calendar-scroll'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { useGridDragCreate } from '@/shared/hooks/planner/use-grid-drag-create'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarView } from '../../../constants/calendar.constants'
import { DayEventsPopover } from './components/day-events-popover/day-events-popover'
import { MonthDayHeader } from './components/month-day-header/month-day-header'

import { useCalendarCopyPaste } from '@/shared/hooks/calendar/use-calendar-copypaste'
import '@schedule-x/theme-default/dist/index.css'
import classes from './calendar.module.scss'

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

		const [selectedEventForModal, setSelectedEventForModal] = useState<SXEvent | null>(null)
		const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)
		const calendarWrapperRef = useRef<HTMLDivElement>(null)
		const isFirstRender = useRef(true)

		const { events, isGoogleLoading } = useCalendarEvents({
			userId: user?.$id,
			start: range.start,
			end: range.end,
			view,
		})
		const { dailyTasksCountByDate } = useDailyTasksCounters({ userId: user?.$id, start: range.start, end: range.end })
		const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()

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

		const { handleDelete } = useEventDeletion({ eventsService, eventModal })
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

		const handleConfirmDelete = async () => {
			if (eventToDelete) {
				await handleDelete(String(eventToDelete.id), eventToDelete.googleEventId as string | undefined)
				setEventToDelete(null)
			}
		}

		const renderEventInfoModal = useCallback(
			(event: SXEvent, onCloseModal?: () => void) => (
				<EventInfoModal
					event={event}
					onConfirmDelete={() => {
						setEventToDelete(event)
						onCloseModal?.()
					}}
					onUpdated={() => onCloseModal?.()}
					onCopy={() => {
						setCopiedEvent(event)
						onCloseModal?.()
					}}
					actions={{ create: handleCreateEvent, update: handleUpdateEvent }}
				/>
			),
			[handleCreateEvent, handleUpdateEvent, setCopiedEvent]
		)

		const customComponents = useMemo(
			() => ({
				eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) =>
					renderEventInfoModal(calendarEvent, () => eventModal.close()),
				weekGridDate: ({ date }: { date: string }) => (
					<WeekDayHeader
						date={date}
						onDayClick={selectedDate =>
							isCopyMode ? handleDateClick(Temporal.PlainDate.from(selectedDate)) : onDayClick(selectedDate)
						}
					/>
				),
				monthGridDate: ({ date, jsDate }: { date: number; jsDate: Date }) => (
					<MonthDayHeader
						date={date}
						jsDate={jsDate}
						onDayClick={selectedDate =>
							isCopyMode ? handleDateClick(Temporal.PlainDate.from(selectedDate)) : onDayClick(selectedDate)
						}
					/>
				),
			}),
			[eventModal, handleDateClick, isCopyMode, onDayClick, renderEventInfoModal]
		)

		return (
			<>
				{copiedEvent && <EventPasteBanner copiedEvent={copiedEvent} onCancel={() => setCopiedEvent(null)} />}

				<DailyTasksCountByDateContext.Provider value={dailyTasksCountByDate}>
					<CalendarCopyModeContext.Provider value={isCopyMode}>
						<div className={classes.calendarWrapper} ref={calendarWrapperRef}>
							<ScheduleXCalendar key={view} customComponents={customComponents} calendarApp={calendar} />
						</div>
					</CalendarCopyModeContext.Provider>
				</DailyTasksCountByDateContext.Provider>

				{selectionInfo?.columnEl &&
					createPortal(
						<div
							className={classes.dragSelection}
							style={{ top: `${selectionInfo.topPx}px`, height: `${selectionInfo.heightPx}px` }}
						>
							<span className={classes.dragTitle}>New Event</span>
							<span className={classes.dragTime}>
								{selectionInfo.startTimeStr} – {selectionInfo.endTimeStr}
							</span>
						</div>,
						selectionInfo.columnEl
					)}

				<DayEventsPopover
					dateStr={popoverState?.dateStr || null}
					anchorEl={popoverState?.anchorEl || null}
					events={mappedEvents}
					onClose={closePopover}
					onEventClick={setSelectedEventForModal}
				/>

				<Modal
					isVisible={Boolean(selectedEventForModal)}
					onClose={() => setSelectedEventForModal(null)}
					style={{ padding: 0, width: 400 }}
				>
					{selectedEventForModal && renderEventInfoModal(selectedEventForModal, () => setSelectedEventForModal(null))}
				</Modal>

				<ConfirmModal
					isVisible={Boolean(eventToDelete)}
					onClose={() => setEventToDelete(null)}
					onConfirm={handleConfirmDelete}
					title='Delete Event'
					message={
						<>
							Are you sure you want to delete &quot;<span className='highlight'>{eventToDelete?.title}</span>&quot;?
						</>
					}
				/>
			</>
		)
	}
)

CalendarInner.displayName = 'CalendarInner'
