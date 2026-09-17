import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { TimeDropdown } from './time-dropdown'

import { EventForm } from '@/shared/types/event'
import { DateTimeIcon } from '@/shared/ui/icons/calendar/date-time-icon'
import { Modal } from '@/shared/ui/modal/modal'
import 'react-day-picker/style.css'
import classes from './date-time.module.scss'

type FormType = EventForm

interface DateTimeProps<T extends FormType> {
	form: T
	setFormField: <K extends keyof T>(key: K, value: T[K]) => void
}

const parseDateString = (dateStr: string) => {
	if (!dateStr) return new Date()
	const [y, m, d] = dateStr.split('-').map(Number)
	return new Date(y, m - 1, d)
}

export const DateTime = <T extends EventForm>({ form, setFormField }: DateTimeProps<T>) => {
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

	const selectedDate = parseDateString(form.date)

	return (
		<div className={classes.dateTime}>
			<div className={classes.icon}>
				<DateTimeIcon width={18} height={18} />
			</div>
			<div className={classes.info}>
				<button className={classes.date} onClick={() => setIsDatePickerOpen(prev => !prev)} type='button'>
					{form.date ? format(parseDateString(form.date), 'EEEE, MMMM d') : 'Pick a date'}
				</button>
				{isDatePickerOpen && (
					<Modal isVisible={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)}>
						<div className={classes.datePickerWrapper}>
							<DayPicker
								mode='single'
								selected={selectedDate}
								onSelect={date => {
									if (date) {
										setFormField('date', format(date, 'yyyy-MM-dd'))
										setIsDatePickerOpen(false)
									}
								}}
							/>
						</div>
					</Modal>
				)}
				<div className={classes.timePickers}>
					<TimeDropdown
						value={form.startTime}
						onChange={value => {
							setFormField('startTime', value)

							if (form.endTime && value >= form.endTime) {
								const [h, m] = value.split(':').map(Number)
								const totalMins = h * 60 + m + 30

								const nextH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0')
								const nextM = String(totalMins % 60).padStart(2, '0')

								setFormField('endTime', `${nextH}:${nextM}`)
							}
						}}
					/>
					<span className={classes.separator}>–</span>
					<TimeDropdown
						value={form.endTime}
						onChange={value => setFormField('endTime', value)}
						compareTime={form.startTime}
					/>
				</div>
			</div>
		</div>
	)
}
