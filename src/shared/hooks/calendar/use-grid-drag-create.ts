import { InitialEventValues } from '@/shared/hooks/calendar/use-event-form'
import { useCalendarOperationStore } from '@/shared/stores/calendar-operation.store'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { formatTimeString } from '@/shared/utils/format-time/format-time'
import { useEffect, useRef } from 'react'

export interface DragSelectionInfo {
	topPx: number
	heightPx: number
	startTimeStr: string
	endTimeStr: string
	columnEl: HTMLElement
}

export interface DragClassNames {
	selection?: string
	title?: string
	time?: string
}

interface UseGridDragCreateProps {
	isPro: boolean
	timeBlocksCount: number
	openPaywall: (id: string) => void
	onRequestCreateModal: (initialValues: InitialEventValues) => void
	classNames?: DragClassNames
}

let globalIsDragJustCompleted = false

export const checkAndResetDragJustCompleted = () => {
	if (globalIsDragJustCompleted) {
		globalIsDragJustCompleted = false
		return true
	}
	return false
}

export const setDragJustCompleted = () => {
	globalIsDragJustCompleted = true
	setTimeout(() => {
		globalIsDragJustCompleted = false
	}, 400)
}

export const useGridDragCreate = ({
	isPro,
	timeBlocksCount,
	openPaywall,
	onRequestCreateModal,
	classNames,
}: UseGridDragCreateProps) => {
	const isDraggingRef = useRef(false)
	const dragStartInfoRef = useRef<{
		columnEl: HTMLElement
		date: string
		startMin: number
		startY: number
		rectTop: number
		gridHeight: number
	} | null>(null)

	const previewElRef = useRef<HTMLDivElement | null>(null)
	const timeElRef = useRef<HTMLSpanElement | null>(null)
	const rafIdRef = useRef<number | null>(null)

	const isProRef = useRef(isPro)
	const timeBlocksCountRef = useRef(timeBlocksCount)
	const openPaywallRef = useRef(openPaywall)
	const onRequestCreateModalRef = useRef(onRequestCreateModal)
	const classNamesRef = useRef(classNames)

	useEffect(() => {
		isProRef.current = isPro
		timeBlocksCountRef.current = timeBlocksCount
		openPaywallRef.current = openPaywall
		onRequestCreateModalRef.current = onRequestCreateModal
		classNamesRef.current = classNames
	}, [isPro, timeBlocksCount, openPaywall, onRequestCreateModal, classNames])

	useEffect(() => {
		const cleanupPreview = () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
			if (previewElRef.current) {
				previewElRef.current.remove()
				previewElRef.current = null
			}
			timeElRef.current = null
		}

		const handlePointerDown = (e: PointerEvent) => {
			if (e.button !== 0) return
			if (useCalendarOperationStore.getState().isMutating) return

			const target = e.target as HTMLElement | null
			if (!target) return

			if (
				target.closest('.sx__event') ||
				target.closest('.sx__time-grid-event') ||
				target.closest('.sx__event-modal') ||
				target.closest('button') ||
				target.closest('input') ||
				target.closest('a')
			) {
				return
			}

			const colEl = target.closest<HTMLElement>('[data-time-grid-date], .sx__time-grid-day, [data-date]')
			if (!colEl) return

			const date =
				colEl.getAttribute('data-time-grid-date') ||
				colEl.getAttribute('data-date') ||
				colEl.getAttribute('data-date-grid')
			if (!date) return

			const rect = colEl.getBoundingClientRect()
			const gridHeight = rect.height || 1032
			const clickY = e.clientY - rect.top

			const minutes = Math.floor(((clickY / gridHeight) * 1440) / 15) * 15
			const clampedMin = Math.max(0, Math.min(1425, minutes))

			dragStartInfoRef.current = {
				columnEl: colEl,
				date,
				startMin: clampedMin,
				startY: clickY,
				rectTop: rect.top,
				gridHeight,
			}
			isDraggingRef.current = false
		}

		const handlePointerMove = (e: PointerEvent) => {
			if (!dragStartInfoRef.current) return

			const { columnEl, startMin, rectTop, gridHeight, startY } = dragStartInfoRef.current
			const currentY = e.clientY - rectTop

			const currentMin = Math.floor(((currentY / gridHeight) * 1440) / 15) * 15
			const clampedCurrentMin = Math.max(0, Math.min(1425, currentMin))

			const diffY = Math.abs(currentY - startY)
			if (diffY > 8) {
				isDraggingRef.current = true
			}

			if (!isDraggingRef.current) return

			const minMin = Math.min(startMin, clampedCurrentMin)
			const maxMin = Math.max(startMin, clampedCurrentMin) + 15

			const topPx = (minMin / 1440) * gridHeight
			const heightPx = ((maxMin - minMin) / 1440) * gridHeight

			const formatTime = (mins: number) => {
				const h = Math.floor(mins / 60)
				const m = mins % 60
				const raw = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
				return formatTimeString(raw, useSettingsStore.getState().timeFormat)
			}

			const timeStr = `${formatTime(minMin)} – ${formatTime(maxMin)}`

			if (!previewElRef.current) {
				const el = document.createElement('div')
				const classes = classNamesRef.current
				if (classes?.selection) {
					el.className = classes.selection
				}

				const titleSpan = document.createElement('span')
				if (classes?.title) {
					titleSpan.className = classes.title
				}
				titleSpan.textContent = 'New Event'

				const timeSpan = document.createElement('span')
				if (classes?.time) {
					timeSpan.className = classes.time
				}
				timeSpan.textContent = timeStr

				el.appendChild(titleSpan)
				el.appendChild(timeSpan)
				columnEl.appendChild(el)

				previewElRef.current = el
				timeElRef.current = timeSpan
			}

			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current)
			}

			rafIdRef.current = requestAnimationFrame(() => {
				if (previewElRef.current) {
					previewElRef.current.style.top = `${topPx}px`
					previewElRef.current.style.height = `${heightPx}px`
				}
				if (timeElRef.current) {
					timeElRef.current.textContent = timeStr
				}
				rafIdRef.current = null
			})
		}

		const handlePointerUp = (e: PointerEvent) => {
			if (!dragStartInfoRef.current) return

			const startInfo = dragStartInfoRef.current
			const wasDragging = isDraggingRef.current

			dragStartInfoRef.current = null
			isDraggingRef.current = false
			cleanupPreview()

			if (wasDragging) {
				setDragJustCompleted()

				const { date, startMin, rectTop, gridHeight } = startInfo
				const currentY = e.clientY - rectTop

				const currentMin = Math.floor(((currentY / gridHeight) * 1440) / 15) * 15
				const clampedCurrentMin = Math.max(0, Math.min(1425, currentMin))

				const minMin = Math.min(startMin, clampedCurrentMin)
				const maxMin = Math.max(startMin, clampedCurrentMin) + 15

				const formatHHMM = (mins: number) => {
					const h = Math.floor(mins / 60)
					const m = mins % 60
					return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
				}

				if (!isProRef.current && timeBlocksCountRef.current >= 50) {
					openPaywallRef.current('planner_blocks_unlimited')
					return
				}

				onRequestCreateModalRef.current({
					date,
					startTime: formatHHMM(minMin),
					endTime: formatHHMM(maxMin),
				})
			}
		}

		window.addEventListener('pointerdown', handlePointerDown)
		window.addEventListener('pointermove', handlePointerMove)
		window.addEventListener('pointerup', handlePointerUp)
		window.addEventListener('pointercancel', handlePointerUp)

		return () => {
			cleanupPreview()
			window.removeEventListener('pointerdown', handlePointerDown)
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', handlePointerUp)
			window.removeEventListener('pointercancel', handlePointerUp)
		}
	}, [])

	return { selectionInfo: null }
}
