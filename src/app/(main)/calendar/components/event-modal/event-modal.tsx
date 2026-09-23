import { updateEvent } from '@/lib/events/events'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calnedar-mutations'
import { InitialEventValues, useEventForm } from '@/shared/hooks/calendar/use-event-form'
import { ColorPicker } from './components/color-picker/color-picker'
import { DateTime } from './components/date-time/date-time'
import { Description } from './components/description/description'
import classes from './event-modal.module.scss'

interface EventModalProps {
	onClose: () => void
	initialTitle?: string
	onSuccess?: () => void
	initialValues?: InitialEventValues
}

export const EventModal = ({ onClose, initialTitle, onSuccess, initialValues }: EventModalProps) => {
	const { handleCreateEvent } = useCalendarMutations()

	const { form, setFormField, handleSubmit } = useEventForm(
		() => {
			onSuccess?.()
			onClose()
		},
		initialValues,
		{
			create: handleCreateEvent,
			update: updateEvent,
		},
		initialTitle
	)

	return (
		<div className={classes.modalInner}>
			<form className={classes.eventForm} onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Title...'
					className={classes.eventTitle}
					aria-label='Event title'
					value={form.title}
					onChange={e => setFormField('title', e.target.value)}
					autoFocus
				/>
				<DateTime form={form} setFormField={setFormField} />
				<Description form={form} setFormField={setFormField} />
				<ColorPicker form={form} setFormField={setFormField} />
				{/* <RecurrencePicker form={form} setFormField={setFormField} /> */}
				<button type='submit' className={classes.saveButton}>
					Save
				</button>
			</form>
		</div>
	)
}
