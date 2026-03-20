import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import TimePicker from 'react-time-picker'

import { EventForm } from '@/shared/types/event'
import { TimeBlockForm } from '@/shared/types/time-block'
import { DateTimeIcon } from '@/shared/ui/icons/calendar/date-time-icon'
import { Modal } from '@/shared/ui/modal/modal'
import 'react-day-picker/style.css'
import 'react-time-picker/dist/TimePicker.css'
import classes from './date-time.module.scss'

type FormType = EventForm | TimeBlockForm

interface DateTimeProps<T extends FormType> {
	form: T
	setFormField: <K extends keyof T>(key: K, value: T[K]) => void
}

export const DateTime = <T extends EventForm | TimeBlockForm>({ form, setFormField }: DateTimeProps<T>) => {
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

	const selectedDate = new Date(form.date)

	return (
		<div className={classes.dateTime}>
			<div className={classes.icon}>
				<DateTimeIcon width={18} height={18} />
			</div>
			<div className={classes.info}>
				<button className={classes.date} onClick={() => setIsDatePickerOpen(prev => !prev)} type='button'>
					{form.date ? format(new Date(form.date), 'EEEE, MMMM d') : 'Pick a date'}
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
					<TimePicker
						className={classes.timePicker}
						onChange={value => value && setFormField('startTime', value)}
						value={form.startTime}
						disableClock={true}
						clearIcon={null}
					/>
					<span>–</span>
					<TimePicker
						className={classes.timePicker}
						onChange={value => value && setFormField('endTime', value)}
						value={form.endTime}
						disableClock={true}
						clearIcon={null}
					/>
				</div>
			</div>
		</div>
	)
}
