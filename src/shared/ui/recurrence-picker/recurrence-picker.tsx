'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { EventForm, RecurrenceFrequency } from '@/shared/types/event'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { getDayOfWeekName, getDefaultRecurrenceConfig } from '@/shared/utils/calendar/recurrence'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import classes from './recurrence-picker.module.scss'

interface RecurrencePickerProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

export const RecurrencePicker = ({ form, setFormField }: RecurrencePickerProps) => {
	const [open, setOpen] = useState(false)
	const { isPro, openPaywall } = useBilling()

	const recurrence = form.recurrence || { frequency: 'none', interval: 1, endType: 'never' }

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

		const nextConfig = getDefaultRecurrenceConfig(nextFreq, form.date)
		setFormField('recurrence', nextConfig)
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
