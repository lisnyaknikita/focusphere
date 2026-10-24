'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { EventForm, RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import { CustomRecurrenceModal } from '@/shared/ui/custom-recurrence-modal/custom-recurrence-modal'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import {
	getDayOfWeekName,
	getDefaultRecurrenceConfig,
	getRecurrenceConfigSummary,
} from '@/shared/utils/calendar/recurrence'
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
	const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
	const { isPro, openPaywall } = useBilling()

	const defaultRecurrence: RecurrenceConfig = useMemo(() => ({ frequency: 'none', interval: 1, endType: 'never' }), [])
	const recurrence = form.recurrence || defaultRecurrence

	const currentDayName = getDayOfWeekName(form.date)
	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const isCustom = useMemo(() => {
		if (recurrence.isCustom) return true
		if (recurrence.frequency === 'none') return false
		if (recurrence.interval > 1) return true
		if (recurrence.endType !== 'never') return true
		if (recurrence.frequency === 'weekly' && recurrence.weekDays && recurrence.weekDays.length > 1) return true
		return false
	}, [recurrence])

	const OPTIONS = useMemo(
		() => [
			{ id: 'none' as RecurrenceFrequency, label: 'Does not repeat' },
			{ id: 'daily' as RecurrenceFrequency, label: 'Every day' },
			{ id: 'weekdays' as RecurrenceFrequency, label: 'Every weekday (Mon–Fri)' },
			{ id: 'weekly' as RecurrenceFrequency, label: `Every week on ${currentDayName}` },
			{ id: 'monthly' as RecurrenceFrequency, label: 'Every month' },
			{ id: 'yearly' as RecurrenceFrequency, label: 'Every year' },
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

	const handleOpenCustom = () => {
		setOpen(false)

		if (!isPro) {
			openPaywall('planner_recurrence')
			return
		}

		setIsCustomModalOpen(true)
	}

	const handleSaveCustom = (customConfig: RecurrenceConfig) => {
		setFormField('recurrence', customConfig)
	}

	const displayLabel = useMemo(() => {
		if (isCustom) {
			return getRecurrenceConfigSummary(recurrence)
		}
		const opt = OPTIONS.find(o => o.id === recurrence.frequency)
		return opt?.label || 'Does not repeat'
	}, [isCustom, recurrence, OPTIONS])

	return (
		<>
			<div className={classes.recurrenceContainer}>
				<div className={classes.selectRow}>
					<span className={classes.label}>
						Repeat
						{!isPro && <span className={classes.proBadge}>PRO</span>}
					</span>

					<div ref={dropdownRef} className={clsx(classes.dropdownWrapper, open && 'opened')}>
						<button
							type='button'
							className={classes.trigger}
							onClick={() => setOpen(prev => !prev)}
							aria-expanded={open}
							title={displayLabel}
						>
							<span>{displayLabel}</span>
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
											className={clsx(
												classes.optionItem,
												!isCustom && recurrence.frequency === opt.id && 'activeOption'
											)}
											onClick={() => handleSelectFrequency(opt.id)}
										>
											<span>{opt.label}</span>
										</button>
									))}

									<div className={classes.divider} />

									<button
										type='button'
										className={clsx(classes.optionItem, isCustom && 'activeOption')}
										onClick={handleOpenCustom}
									>
										<span>Custom...</span>
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			<CustomRecurrenceModal
				isVisible={isCustomModalOpen}
				onClose={() => setIsCustomModalOpen(false)}
				initialConfig={recurrence}
				eventDate={form.date}
				onSave={handleSaveCustom}
			/>
		</>
	)
}
