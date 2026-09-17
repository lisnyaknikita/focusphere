import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useBilling } from '@/shared/context/billing-context'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { InitialEventValues } from '@/shared/hooks/calendar/use-event-form'
import { useCalendarEvents } from '@/shared/hooks/events/use-calendar-events'
import { useDailyTasksCounters } from '@/shared/hooks/planner/use-daily-tasks-counters'
import { useGridDragCreate } from '@/shared/hooks/planner/use-grid-drag-create'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'

import '@schedule-x/theme-default/dist/index.css'

import { WeekDayHeader } from '@/app/(main)/planner/components/main/planner-inner/components/week-day-header/week-day-header'
import { DailyTasksCountByDateContext } from '@/app/(main)/planner/daily-tasks-count-context'
import { CalendarCopyModeContext } from '@/features/calendar/calendar-copy-mode-context'
import { EventPasteBanner } from '@/features/calendar/event-paste-banner'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calnedar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { useCalendarScroll } from '@/shared/hooks/planner/use-calendar-scroll'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarView } from '../../../constants/calendar.constants'
import { MonthDayHeader } from './components/month-day-header/month-day-header'

import classes from './calendar.module.scss'
import { DayEventsPopover } from './components/day-events-popover/day-events-popover'

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
		const { events, isGoogleLoading } = useCalendarEvents({
			userId: user?.$id,
			start: range.start,
			end: range.end,
			view,
		})
		const { dailyTasksCountByDate } = useDailyTasksCounters({ userId: user?.$id, start: range.start, end: range.end })

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

		const [popoverState, setPopoverState] = useState<{
			dateStr: string
			anchorEl: HTMLElement
		} | null>(null)
		const [selectedEventForModal, setSelectedEventForModal] = useState<SXEvent | null>(null)
		const [copiedEvent, setCopiedEvent] = useState<SXEvent | null>(null)
		const copiedEventRef = useRef<SXEvent | null>(null)
		copiedEventRef.current = copiedEvent

		const calendarWrapperRef = useRef<HTMLDivElement>(null)

		const onDayClickRef = useRef(onDayClick)
		onDayClickRef.current = onDayClick

		const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()

		const handleDateClick = useCallback(
			async (date: Temporal.PlainDate) => {
				if (!copiedEventRef.current || !user) {
					quickCreate(date.toZonedDateTime({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }))
					return
				}
				const currentCopied = copiedEventRef.current
				const startStr = currentCopied.start.toString()
				const endStr = currentCopied.end.toString()
				const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
				const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'
				const dateIso = date.toString()

				setCopiedEvent(null)

				await handleCreateEvent({
					title: currentCopied.title || 'Untitled event',
					description: currentCopied.description as string | undefined,
					startDate: localDateTimeToInstant(dateIso, startTime),
					endDate: localDateTimeToInstant(dateIso, endTime),
					color: (currentCopied.color as string) || '#D79716',
					calendarId: (currentCopied.calendarId as string) || 'default',
					userId: user.$id,
				})
			},
			[handleCreateEvent, quickCreate, user]
		)

		const handleDateClickRef = useRef(handleDateClick)
		handleDateClickRef.current = handleDateClick

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
			timeBlocksCount: events.filter(event => event.source !== 'google').length,
			openPaywall,
			onRequestCreateModal: onRequestCreate,
		})

		const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)
		const isFirstRender = useRef(true)

		useCalendarScroll({ dependencies: [view] })

		const handleConfirmDelete = async () => {
			if (eventToDelete) {
				await handleDelete(String(eventToDelete.id), eventToDelete.googleEventId as string | undefined)
				setEventToDelete(null)
			}
		}

		useEffect(() => {
			const el = calendarWrapperRef.current
			if (!el) return

			const handleNativeClickCapture = (e: MouseEvent) => {
				const target = e.target as HTMLElement
				const moreBtn = target.closest(
					'.sx__month-grid-day__events-more, .sx__month-grid-day__more-events-button'
				) as HTMLElement | null

				if (moreBtn) {
					e.preventDefault()
					e.stopPropagation()
					e.stopImmediatePropagation()

					const dayCell = moreBtn.closest('[data-date]')
					const dateStr = dayCell?.getAttribute('data-date')

					if (dateStr) {
						setPopoverState({ dateStr, anchorEl: moreBtn })
					}
				}
			}

			el.addEventListener('click', handleNativeClickCapture, true)
			return () => {
				el.removeEventListener('click', handleNativeClickCapture, true)
			}
		}, [])

		const mappedEvents = useMemo(() => {
			return events.map(mapEventToScheduleX)
		}, [events])

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

		const customComponents = useMemo(
			() => ({
				eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => (
					<EventInfoModal
						event={calendarEvent}
						onConfirmDelete={() => setEventToDelete(calendarEvent)}
						onUpdated={() => eventModal.close()}
						onCopy={
							view !== 'day'
								? () => {
										setCopiedEvent(calendarEvent)
										eventModal.close()
								  }
								: undefined
						}
						actions={{
							create: handleCreateEvent,
							update: handleUpdateEvent,
						}}
					/>
				),
				weekGridDate: ({ date }: { date: string }) => (
					<WeekDayHeader
						date={date}
						onDayClick={selectedDate =>
							copiedEventRef.current
								? handleDateClickRef.current(Temporal.PlainDate.from(selectedDate))
								: onDayClickRef.current(selectedDate)
						}
					/>
				),
				monthGridDate: ({ date, jsDate }: { date: number; jsDate: Date }) => (
					<MonthDayHeader
						date={date}
						jsDate={jsDate}
						onDayClick={selectedDate =>
							copiedEventRef.current
								? handleDateClickRef.current(Temporal.PlainDate.from(selectedDate))
								: onDayClickRef.current(selectedDate)
						}
					/>
				),
			}),
			[handleCreateEvent, handleUpdateEvent, eventModal, view]
		)

		return (
			<>
				{copiedEvent && <EventPasteBanner copiedEvent={copiedEvent} onCancel={() => setCopiedEvent(null)} />}
				<DailyTasksCountByDateContext.Provider value={dailyTasksCountByDate}>
					<CalendarCopyModeContext.Provider value={Boolean(copiedEvent)}>
						<div className={classes.calendarWrapper} ref={calendarWrapperRef}>
							<ScheduleXCalendar key={view} customComponents={customComponents} calendarApp={calendar} />
						</div>
					</CalendarCopyModeContext.Provider>
				</DailyTasksCountByDateContext.Provider>
				{selectionInfo?.columnEl &&
					createPortal(
						<div
							className={classes.dragSelection}
							style={{
								top: `${selectionInfo.topPx}px`,
								height: `${selectionInfo.heightPx}px`,
							}}
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
					onClose={() => setPopoverState(null)}
					onEventClick={event => setSelectedEventForModal(event)}
				/>
				<Modal
					isVisible={Boolean(selectedEventForModal)}
					onClose={() => setSelectedEventForModal(null)}
					style={{ padding: 0, width: 400 }}
				>
					{selectedEventForModal && (
						<EventInfoModal
							event={selectedEventForModal}
							onConfirmDelete={() => {
								setEventToDelete(selectedEventForModal)
								setSelectedEventForModal(null)
							}}
							onUpdated={() => setSelectedEventForModal(null)}
							onCopy={
								view !== 'day'
									? () => {
											setCopiedEvent(selectedEventForModal)
											setSelectedEventForModal(null)
									  }
									: undefined
							}
							actions={{
								create: handleCreateEvent,
								update: handleUpdateEvent,
							}}
						/>
					)}
				</Modal>
				<ConfirmModal
					isVisible={!!eventToDelete}
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
