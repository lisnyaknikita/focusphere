import { EventForm } from '@/shared/types/event'
import { DescriptionIcon } from '@/shared/ui/icons/calendar/description-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import classes from './description.module.scss'

interface DescriptionProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

export const Description = ({ form, setFormField }: DescriptionProps) => {
	const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
	const [isEditingDescription, setIsEditingDescription] = useState(false)

	return (
		<div className={classes.description}>
			<div className={classes.icon}>
				<DescriptionIcon />
			</div>
			{!form.description ? (
				<button
					className={classes.addButton}
					onClick={() => {
						setIsEditingDescription(true)
						setIsDescriptionOpen(true)
					}}
					type='button'
				>
					Add description
				</button>
			) : (
				<button className={classes.addButton} onClick={() => setIsDescriptionOpen(true)} type='button'>
					Show description
				</button>
			)}
			{isDescriptionOpen && (
				<Modal
					isVisible={isDescriptionOpen}
					onClose={() => {
						setIsDescriptionOpen(false)
						setIsEditingDescription(false)
					}}
				>
					{isEditingDescription ? (
						<form className={classes.descriptionForm}>
							<textarea
								className={classes.descriptionTextarea}
								placeholder='Add a description'
								value={form.description || ''}
								onChange={e => {
									const value = e.target.value.trim() === '' ? undefined : e.target.value
									setFormField('description', value)
								}}
								autoFocus
							/>
							<button
								type='button'
								onClick={() => {
									setIsEditingDescription(false)
									setIsDescriptionOpen(false)
								}}
								className={classes.saveDescriptionButton}
							>
								Save
							</button>
						</form>
					) : (
						<div className={classes.descriptionContent} onClick={() => setIsEditingDescription(true)}>
							<p>{form.description || ''}</p>
						</div>
					)}
				</Modal>
			)}
		</div>
	)
}
