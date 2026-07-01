import { ColorPicker } from '@/app/(main)/calendar/components/event-modal/components/color-picker/color-picker'
import { DateTime } from '@/app/(main)/calendar/components/event-modal/components/date-time/date-time'
import { Description } from '@/app/(main)/calendar/components/event-modal/components/description/description'
import { EventForm } from '@/shared/types/event'
import classes from './event-edit-view.module.scss'

interface EventEditViewProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
	handleSubmit: (e: React.FormEvent) => void
	isTimeBlock?: boolean
	onCancel: () => void
}

export const EventEditView = ({ form, setFormField, handleSubmit, isTimeBlock, onCancel }: EventEditViewProps) => {
	return (
		<form onSubmit={handleSubmit} className={classes.editForm}>
			<input
				className={classes.titleInput}
				value={form.title}
				placeholder='Title...'
				onChange={e => setFormField('title', e.target.value)}
				autoFocus
			/>
			<DateTime form={form} setFormField={setFormField} />
			{!isTimeBlock && <Description form={form} setFormField={setFormField} />}
			<ColorPicker form={form} setFormField={setFormField} />

			<div className={classes.actions}>
				<button type='button' className={classes.cancelBtn} onClick={onCancel}>
					Cancel
				</button>
				<button type='submit' className={classes.saveBtn}>
					Save
				</button>
			</div>
		</form>
	)
}
