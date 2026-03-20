import { ColorPicker } from '@/app/(main)/calendar/components/event-modal/components/color-picker/color-picker'
import { DateTime } from '@/app/(main)/calendar/components/event-modal/components/date-time/date-time'
import { useTimeBlockForm } from '@/shared/hooks/planner/use-timeblock-form'
import { CloseButtonIcon } from '@/shared/ui/icons/calendar/close-button-icon'
import classes from './time-block-modal.module.scss'

interface TimeBlockModalProps {
	onClose: () => void
}

export const TimeBlockModal = ({ onClose }: TimeBlockModalProps) => {
	const { form, setFormField, handleSubmit } = useTimeBlockForm(onClose)

	return (
		<div className={classes.modalInner}>
			<form className={classes.eventForm} onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Title...'
					className={classes.eventTitle}
					aria-label='Time block'
					value={form.title}
					onChange={e => setFormField('title', e.target.value)}
					autoFocus
				/>
				<DateTime form={form} setFormField={setFormField} />
				<ColorPicker form={form} setFormField={setFormField} />
				<button className={classes.saveButton}>Save</button>
			</form>
			<button className={classes.closeButton} onClick={() => onClose()}>
				<CloseButtonIcon />
			</button>
		</div>
	)
}
