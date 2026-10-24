'use client'

import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import { Modal } from '@/shared/ui/modal/modal'
import { getDayOfWeekIndex } from '@/shared/utils/calendar/recurrence'
import { useEffect, useState } from 'react'
import 'temporal-polyfill/global'
import { RecurrenceEndOptions } from './components/recurrence-end-options/recurrence-end-options'
import { RecurrenceUnit, RecurrenceUnitSelect } from './components/recurrence-unit-select/recurrence-unit-select'
import { WeekDaysSelector } from './components/weekdays-selector/weekdays-selector'
import classes from './custom-recurrence-modal.module.scss'

interface CustomRecurrenceModalProps {
	isVisible: boolean
	onClose: () => void
	initialConfig?: RecurrenceConfig
	eventDate: string
	onSave: (config: RecurrenceConfig) => void
}

const getInitialUnit = (freq?: RecurrenceFrequency): RecurrenceUnit => {
	switch (freq) {
		case 'daily':
			return 'day'
		case 'weekly':
		case 'weekdays':
			return 'week'
		case 'monthly':
			return 'month'
		case 'yearly':
			return 'year'
		default:
			return 'week'
	}
}

const getDefaultEndDate = (dateStr: string): string => {
	try {
		return Temporal.PlainDate.from(dateStr).add({ months: 1 }).toString()
	} catch {
		return Temporal.Now.plainDateISO().add({ months: 1 }).toString()
	}
}

export const CustomRecurrenceModal = ({
	isVisible,
	onClose,
	initialConfig,
	eventDate,
	onSave,
}: CustomRecurrenceModalProps) => {
	const defaultDayIndex = getDayOfWeekIndex(eventDate)

	const [interval, setInterval] = useState<number>(1)
	const [unit, setUnit] = useState<RecurrenceUnit>('week')
	const [unitDropdownOpen, setUnitDropdownOpen] = useState(false)
	const [weekDays, setWeekDays] = useState<number[]>([defaultDayIndex])
	const [endType, setEndType] = useState<'never' | 'until' | 'count'>('never')
	const [endDate, setEndDate] = useState<string>('')
	const [count, setCount] = useState<number>(10)

	const unitDropdownRef = useClickOutside<HTMLDivElement>(() => setUnitDropdownOpen(false), unitDropdownOpen)

	useEffect(() => {
		if (isVisible) {
			const currentDay = getDayOfWeekIndex(eventDate)
			setInterval(Math.max(1, initialConfig?.interval || 1))
			setUnit(getInitialUnit(initialConfig?.frequency))
			setUnitDropdownOpen(false)
			setWeekDays(initialConfig?.weekDays && initialConfig.weekDays.length > 0 ? initialConfig.weekDays : [currentDay])
			setEndType(initialConfig?.endType || 'never')
			setEndDate(initialConfig?.endDate || getDefaultEndDate(eventDate))
			setCount(initialConfig?.count || 10)
		}
	}, [isVisible, initialConfig, eventDate])

	const toggleDay = (dayIndex: number) => {
		setWeekDays(prev => {
			if (prev.includes(dayIndex)) {
				if (prev.length <= 1) return prev
				return prev.filter(d => d !== dayIndex)
			}
			return [...prev, dayIndex].sort((a, b) => a - b)
		})
	}

	const handleSave = () => {
		const frequency: RecurrenceFrequency =
			unit === 'day' ? 'daily' : unit === 'week' ? 'weekly' : unit === 'month' ? 'monthly' : 'yearly'

		const config: RecurrenceConfig = {
			frequency,
			interval: Math.max(1, interval || 1),
			weekDays: unit === 'week' ? weekDays : undefined,
			endType,
			endDate: endType === 'until' ? endDate : undefined,
			count: endType === 'count' ? Math.max(1, count || 1) : undefined,
			isCustom: true,
		}

		onSave(config)
		onClose()
	}

	return (
		<Modal isVisible={isVisible} onClose={onClose} className={classes.customModal}>
			<div className={classes.content}>
				<h3 className={classes.title}>Custom recurrence</h3>

				<div className={classes.section}>
					<label className={classes.sectionLabel}>Repeat every</label>
					<RecurrenceUnitSelect
						interval={interval}
						setInterval={setInterval}
						unit={unit}
						setUnit={setUnit}
						unitDropdownOpen={unitDropdownOpen}
						setUnitDropdownOpen={setUnitDropdownOpen}
						unitDropdownRef={unitDropdownRef}
					/>
				</div>

				{unit === 'week' && <WeekDaysSelector weekDays={weekDays} onToggleDay={toggleDay} />}

				<RecurrenceEndOptions
					endType={endType}
					setEndType={setEndType}
					endDate={endDate}
					setEndDate={setEndDate}
					count={count}
					setCount={setCount}
				/>
			</div>

			<div className={classes.actions}>
				<button type='button' className={classes.cancelButton} onClick={onClose}>
					Cancel
				</button>
				<button type='button' className={classes.confirmButton} onClick={handleSave}>
					Done
				</button>
			</div>
		</Modal>
	)
}
