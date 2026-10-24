import { EventForm } from '@/shared/types/event'
import { DatePicker } from '@/shared/ui/date-picker/date-picker'
import { DateTimeIcon } from '@/shared/ui/icons/calendar/date-time-icon'
import classes from './date-time.module.scss'
import { TimeDropdown } from './time-dropdown'

type FormType = EventForm

interface DateTimeProps<T extends FormType> {
	form: T
	setFormField: <K extends keyof T>(key: K, value: T[K]) => void
}

export const DateTime = <T extends EventForm>({ form, setFormField }: DateTimeProps<T>) => {
	return (
		<div className={classes.dateTime}>
			<div className={classes.icon}>
				<DateTimeIcon width={18} height={18} />
			</div>
			<div className={classes.info}>
				<DatePicker
					value={form.date}
					onChange={dateStr => setFormField('date', dateStr)}
					formatString='EEEE, MMMM d'
					buttonClassName={classes.date}
				/>
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
