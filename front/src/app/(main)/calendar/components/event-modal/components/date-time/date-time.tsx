import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import TimePicker from 'react-time-picker'

import { EventForm } from '@/shared/types/event'
import { Modal } from '@/shared/ui/modal/modal'
import 'react-day-picker/style.css'
import 'react-time-picker/dist/TimePicker.css'
import classes from './date-time.module.scss'

interface DateTimeProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

export const DateTime = ({ form, setFormField }: DateTimeProps) => {
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

	const selectedDate = new Date(form.date)

	return (
		<div className={classes.dateTime}>
			<div className={classes.icon}>
				<svg width='22' height='22' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46143 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.40619 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z'
						fill='white'
					/>
					<path
						d='M7.99964 4C7.82283 4 7.65326 4.07024 7.52823 4.19526C7.40321 4.32029 7.33297 4.48986 7.33297 4.66667V7.55L5.08564 8.958C4.93535 9.05189 4.82851 9.20163 4.78863 9.37429C4.74875 9.54695 4.77909 9.72838 4.87297 9.87867C4.96686 10.029 5.1166 10.1358 5.28926 10.1757C5.46192 10.2156 5.64335 10.1852 5.79364 10.0913L8.35364 8.49133C8.45036 8.43073 8.52991 8.34631 8.58465 8.24616C8.6394 8.146 8.66751 8.03347 8.66631 7.91933V4.66667C8.66631 4.48986 8.59607 4.32029 8.47104 4.19526C8.34602 4.07024 8.17645 4 7.99964 4Z'
						fill='white'
					/>
				</svg>
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
