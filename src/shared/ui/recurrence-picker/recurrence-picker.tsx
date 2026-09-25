'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { EventForm, RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import 'temporal-polyfill/global'
import classes from './recurrence-picker.module.scss'

interface RecurrencePickerProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

const getDayOfWeekIndex = (dateStr?: string): number => {
	if (!dateStr) return 0
	try {
		const plainDate = Temporal.PlainDate.from(dateStr)
		return (plainDate.dayOfWeek - 1 + 7) % 7
	} catch {
		return 0
	}
}

const getDayOfWeekName = (dateStr?: string): string => {
	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const idx = getDayOfWeekIndex(dateStr)
	return dayNames[idx] || 'day'
}

export const RecurrencePicker = ({ form, setFormField }: RecurrencePickerProps) => {
	const [open, setOpen] = useState(false)
	const { isPro, openPaywall } = useBilling()

	const recurrence = form.recurrence || { frequency: 'none', interval: 1, endType: 'never' }

	const currentDayIndex = getDayOfWeekIndex(form.date)
	const currentDayName = getDayOfWeekName(form.date)

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const OPTIONS = useMemo(
		() => [
			{ id: 'none' as RecurrenceFrequency, label: 'Does not repeat' },
			{ id: 'daily' as RecurrenceFrequency, label: 'Every day' },
			{ id: 'weekdays' as RecurrenceFrequency, label: 'Every weekday (Mon–Fri)' },
			{ id: 'weekly' as RecurrenceFrequency, label: `Every week on ${currentDayName}` },
			{ id: 'monthly' as RecurrenceFrequency, label: 'Every month' },
		],
		[currentDayName]
	)

	const handleSelectFrequency = (nextFreq: RecurrenceFrequency) => {
		setOpen(false)

		if (nextFreq !== 'none' && !isPro) {
			openPaywall('planner_recurrence')
			return
		}

		let next: RecurrenceConfig

		switch (nextFreq) {
			case 'none':
				next = { frequency: 'none', interval: 1, endType: 'never' }
				break
			case 'daily':
				next = { frequency: 'daily', interval: 1, endType: 'never' }
				break
			case 'weekdays':
				next = { frequency: 'weekdays', interval: 1, weekDays: [0, 1, 2, 3, 4], endType: 'never' }
				break
			case 'weekly':
				next = { frequency: 'weekly', interval: 1, weekDays: [currentDayIndex], endType: 'never' }
				break
			case 'monthly':
				next = { frequency: 'monthly', interval: 1, endType: 'never' }
				break
			default:
				next = { frequency: 'none', interval: 1, endType: 'never' }
		}

		setFormField('recurrence', next)
	}

	const activeOption = OPTIONS.find(opt => opt.id === recurrence.frequency)

	return (
		<div className={classes.recurrenceContainer}>
			<div className={classes.selectRow}>
				<span className={classes.label}>
					Repeat
					{!isPro && <span className={classes.proBadge}>PRO</span>}
				</span>

				<div ref={dropdownRef} className={clsx(classes.dropdownWrapper, open && 'opened')}>
					<button type='button' className={classes.trigger} onClick={() => setOpen(prev => !prev)} aria-expanded={open}>
						<span>{activeOption?.label || 'Does not repeat'}</span>
						<ArrowBottomIcon />
					</button>

					<AnimatePresence>
						{open && (
							<motion.div
								className={classes.dropdown}
								initial={{ opacity: 0, scale: 0.95, y: -6 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.97, y: -4 }}
								transition={{ duration: 0.18, ease: 'easeOut' }}
							>
								{OPTIONS.map(opt => (
									<button
										type='button'
										key={opt.id}
										className={clsx(classes.optionItem, recurrence.frequency === opt.id && 'activeOption')}
										onClick={() => handleSelectFrequency(opt.id)}
									>
										<span>{opt.label}</span>
									</button>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
