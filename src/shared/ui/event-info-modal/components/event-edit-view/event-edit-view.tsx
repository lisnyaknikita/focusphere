import { ColorPicker } from '@/app/(main)/calendar/components/event-modal/components/color-picker/color-picker'
import { DateTime } from '@/app/(main)/calendar/components/event-modal/components/date-time/date-time'
import { Description } from '@/app/(main)/calendar/components/event-modal/components/description/description'
import { useCalendarOperationStore } from '@/shared/stores/calendar-operation.store'
import { EventForm } from '@/shared/types/event'
import { RecurrencePicker } from '@/shared/ui/recurrence-picker/recurrence-picker'
import classes from './event-edit-view.module.scss'

interface EventEditViewProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
	handleSubmit: (e: React.FormEvent) => void
	onCancel: () => void
}

export const EventEditView = ({ form, setFormField, handleSubmit, onCancel }: EventEditViewProps) => {
	const isMutating = useCalendarOperationStore(state => state.isMutating)

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
			<Description form={form} setFormField={setFormField} />
			<ColorPicker form={form} setFormField={setFormField} />
			<RecurrencePicker form={form} setFormField={setFormField} />

			<div className={classes.actions}>
				<button type='button' className={classes.cancelBtn} onClick={onCancel} disabled={isMutating}>
					Cancel
				</button>
				<button type='submit' className={classes.saveBtn} disabled={isMutating}>
					{isMutating ? 'Saving…' : 'Save'}
				</button>
			</div>
		</form>
	)
}
