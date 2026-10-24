import { DatePicker } from '@/shared/ui/date-picker/date-picker'
import clsx from 'clsx'
import classes from '../../custom-recurrence-modal.module.scss'

interface RecurrenceEndOptionsProps {
	endType: 'never' | 'until' | 'count'
	setEndType: (type: 'never' | 'until' | 'count') => void
	endDate: string
	setEndDate: (date: string) => void
	count: number
	setCount: (count: number) => void
}

export const RecurrenceEndOptions = ({
	endType,
	setEndType,
	endDate,
	setEndDate,
	count,
	setCount,
}: RecurrenceEndOptionsProps) => {
	return (
		<div className={classes.section}>
			<label className={classes.sectionLabel}>Ends</label>
			<div className={classes.endsOptions}>
				<label className={clsx(classes.radioOption, endType === 'never' && classes.radioOptionActive)}>
					<input
						type='radio'
						name='recurrence-end-type'
						checked={endType === 'never'}
						onChange={() => setEndType('never')}
						className={classes.hiddenRadio}
					/>
					<span className={classes.radioCircle}>
						<span className={classes.radioDot} />
					</span>
					<span className={classes.radioText}>Never</span>
				</label>

				<div className={classes.radioOptionRow}>
					<label className={clsx(classes.radioOption, endType === 'until' && classes.radioOptionActive)}>
						<input
							type='radio'
							name='recurrence-end-type'
							checked={endType === 'until'}
							onChange={() => setEndType('until')}
							className={classes.hiddenRadio}
						/>
						<span className={classes.radioCircle}>
							<span className={classes.radioDot} />
						</span>
						<span className={classes.radioText}>On</span>
					</label>
					<DatePicker
						value={endDate}
						disabled={endType !== 'until'}
						onOpen={() => setEndType('until')}
						onChange={val => {
							setEndType('until')
							setEndDate(val)
						}}
						buttonClassName={classes.datePickerBtn}
					/>
				</div>

				<div className={classes.radioOptionRow}>
					<label className={clsx(classes.radioOption, endType === 'count' && classes.radioOptionActive)}>
						<input
							type='radio'
							name='recurrence-end-type'
							checked={endType === 'count'}
							onChange={() => setEndType('count')}
							className={classes.hiddenRadio}
						/>
						<span className={classes.radioCircle}>
							<span className={classes.radioDot} />
						</span>
						<span className={classes.radioText}>After</span>
					</label>
					<div className={classes.countInputWrapper}>
						<input
							type='number'
							min={1}
							max={999}
							className={clsx(classes.countInput, endType !== 'count' && classes.inputDisabled)}
							value={count}
							onFocus={() => setEndType('count')}
							onChange={e => {
								setEndType('count')
								const val = parseInt(e.target.value, 10)
								setCount(isNaN(val) ? 1 : Math.max(1, Math.min(999, val)))
							}}
						/>
						<span
							className={clsx(classes.occurrencesText, endType !== 'count' && classes.textDisabled)}
							onClick={() => setEndType('count')}
						>
							occurrences
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
