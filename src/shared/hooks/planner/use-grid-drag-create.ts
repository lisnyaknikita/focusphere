'use client'

import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useEffect, useRef, useState } from 'react'

export interface DragSelectionInfo {
	topPx: number
	heightPx: number
	startTimeStr: string
	endTimeStr: string
	columnEl: HTMLElement
}

interface UseGridDragCreateProps {
	isPro: boolean
	timeBlocksCount: number
	openPaywall: (id: string) => void
	createQuickBlockWithRange: (startIso: string, endIso: string) => Promise<SXEvent | null>
	onQuickBlockCreated: (event: SXEvent) => void
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
	createQuickBlockWithRange,
	onQuickBlockCreated,
}: UseGridDragCreateProps) => {
	const [selectionInfo, setSelectionInfo] = useState<DragSelectionInfo | null>(null)

	const isDraggingRef = useRef(false)
	const dragStartInfoRef = useRef<{
		columnEl: HTMLElement
		date: string
		startMin: number
		startY: number
	} | null>(null)

	const isProRef = useRef(isPro)
	const timeBlocksCountRef = useRef(timeBlocksCount)
	const openPaywallRef = useRef(openPaywall)
	const createQuickBlockWithRangeRef = useRef(createQuickBlockWithRange)
	const onQuickBlockCreatedRef = useRef(onQuickBlockCreated)

	useEffect(() => {
		isProRef.current = isPro
		timeBlocksCountRef.current = timeBlocksCount
		openPaywallRef.current = openPaywall
		createQuickBlockWithRangeRef.current = createQuickBlockWithRange
		onQuickBlockCreatedRef.current = onQuickBlockCreated
	}, [isPro, timeBlocksCount, openPaywall, createQuickBlockWithRange, onQuickBlockCreated])

	useEffect(() => {
		const handlePointerDown = (e: PointerEvent) => {
			if (e.button !== 0) return

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
			const clickY = e.clientY - rect.top
			const gridHeight = rect.height || 1032

			const minutes = Math.floor(((clickY / gridHeight) * 1440) / 15) * 15
			const clampedMin = Math.max(0, Math.min(1425, minutes))

			dragStartInfoRef.current = {
				columnEl: colEl,
				date,
				startMin: clampedMin,
				startY: clickY,
			}
			isDraggingRef.current = false
		}

		const handlePointerMove = (e: PointerEvent) => {
			if (!dragStartInfoRef.current) return

			const { columnEl, startMin } = dragStartInfoRef.current
			const rect = columnEl.getBoundingClientRect()
			const currentY = e.clientY - rect.top
			const gridHeight = rect.height || 1032

			const currentMin = Math.floor(((currentY / gridHeight) * 1440) / 15) * 15
			const clampedCurrentMin = Math.max(0, Math.min(1425, currentMin))

			const diffY = Math.abs(currentY - dragStartInfoRef.current.startY)
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
				return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
			}

			setSelectionInfo({
				topPx,
				heightPx,
				startTimeStr: formatTime(minMin),
				endTimeStr: formatTime(maxMin),
				columnEl,
			})
		}

		const handlePointerUp = async (e: PointerEvent) => {
			if (!dragStartInfoRef.current) return

			const startInfo = dragStartInfoRef.current
			const wasDragging = isDraggingRef.current

			dragStartInfoRef.current = null
			isDraggingRef.current = false
			setSelectionInfo(null)

			if (wasDragging) {
				setDragJustCompleted()

				const { columnEl, date, startMin } = startInfo
				const rect = columnEl.getBoundingClientRect()
				const currentY = e.clientY - rect.top
				const gridHeight = rect.height || 1032

				const currentMin = Math.floor(((currentY / gridHeight) * 1440) / 15) * 15
				const clampedCurrentMin = Math.max(0, Math.min(1425, currentMin))

				const minMin = Math.min(startMin, clampedCurrentMin)
				const maxMin = Math.max(startMin, clampedCurrentMin) + 15

				const formatIso = (mins: number) => {
					const h = Math.floor(mins / 60)
					const m = mins % 60
					const [year, month, day] = date.split('-').map(Number)
					const d = new Date(year, month - 1, day, h, m, 0, 0)
					return d.toISOString()
				}

				if (!isProRef.current && timeBlocksCountRef.current >= 50) {
					openPaywallRef.current('planner_blocks_unlimited')
					return
				}

				const startIso = formatIso(minMin)
				const endIso = formatIso(maxMin)

				const event = await createQuickBlockWithRangeRef.current(startIso, endIso)
				if (event) {
					onQuickBlockCreatedRef.current(event)
				}
			}
		}

		window.addEventListener('pointerdown', handlePointerDown)
		window.addEventListener('pointermove', handlePointerMove)
		window.addEventListener('pointerup', handlePointerUp)

		return () => {
			window.removeEventListener('pointerdown', handlePointerDown)
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', handlePointerUp)
		}
	}, [])

	return { selectionInfo }
}
