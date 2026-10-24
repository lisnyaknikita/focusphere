import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import classes from '../../custom-recurrence-modal.module.scss'

export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year'

export const UNIT_OPTIONS: { id: RecurrenceUnit; singular: string; plural: string }[] = [
	{ id: 'day', singular: 'day', plural: 'days' },
	{ id: 'week', singular: 'week', plural: 'weeks' },
	{ id: 'month', singular: 'month', plural: 'months' },
	{ id: 'year', singular: 'year', plural: 'years' },
]

interface RecurrenceUnitSelectProps {
	interval: number
	setInterval: (val: number) => void
	unit: RecurrenceUnit
	setUnit: (unit: RecurrenceUnit) => void
	unitDropdownOpen: boolean
	setUnitDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
	unitDropdownRef: React.RefObject<HTMLDivElement | null>
}

export const RecurrenceUnitSelect = ({
	interval,
	setInterval,
	unit,
	setUnit,
	unitDropdownOpen,
	setUnitDropdownOpen,
	unitDropdownRef,
}: RecurrenceUnitSelectProps) => {
	const currentUnitOption = UNIT_OPTIONS.find(u => u.id === unit)
	const currentUnitLabel = interval === 1 ? currentUnitOption?.singular : currentUnitOption?.plural

	return (
		<div className={classes.repeatEveryRow}>
			<input
				type='number'
				min={1}
				max={99}
				className={classes.numberInput}
				value={interval}
				onChange={e => {
					const val = parseInt(e.target.value, 10)
					setInterval(isNaN(val) ? 1 : Math.max(1, Math.min(99, val)))
				}}
			/>

			<div ref={unitDropdownRef} className={clsx(classes.dropdownWrapper, unitDropdownOpen && classes.opened)}>
				<button
					type='button'
					className={classes.unitTrigger}
					onClick={() => setUnitDropdownOpen(prev => !prev)}
					aria-expanded={unitDropdownOpen}
				>
					<span>{currentUnitLabel}</span>
					<ArrowBottomIcon />
				</button>

				<AnimatePresence>
					{unitDropdownOpen && (
						<motion.div
							className={classes.dropdown}
							initial={{ opacity: 0, scale: 0.95, y: -6 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97, y: -4 }}
							transition={{ duration: 0.18, ease: 'easeOut' }}
						>
							{UNIT_OPTIONS.map(opt => (
								<button
									key={opt.id}
									type='button'
									className={clsx(classes.optionItem, unit === opt.id && classes.activeOption)}
									onClick={() => {
										setUnit(opt.id)
										setUnitDropdownOpen(false)
									}}
								>
									<span>{interval === 1 ? opt.singular : opt.plural}</span>
								</button>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
