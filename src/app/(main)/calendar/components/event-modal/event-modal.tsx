import { createEvent, updateEvent } from '@/lib/events/events'
import { useEventForm } from '@/shared/hooks/calendar/use-event-form'
import { CloseButtonIcon } from '@/shared/ui/icons/calendar/close-button-icon'
import { ColorPicker } from './components/color-picker/color-picker'
import { DateTime } from './components/date-time/date-time'
import { Description } from './components/description/description'
import classes from './event-modal.module.scss'

interface EventModalProps {
	onClose: () => void
}

export const EventModal = ({ onClose }: EventModalProps) => {
	const { form, setFormField, handleSubmit } = useEventForm(onClose, undefined, {
		create: createEvent,
		update: updateEvent,
	})

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
				<button className={classes.saveButton}>Save</button>
			</form>
			<button className={classes.closeButton} onClick={() => onClose()}>
				<CloseButtonIcon />
			</button>
		</div>
	)
}
