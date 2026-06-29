import { EventForm } from '@/shared/types/event'
import { DescriptionIcon } from '@/shared/ui/icons/calendar/description-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState, KeyboardEvent } from 'react'
import classes from './description.module.scss'

interface DescriptionProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

export const Description = ({ form, setFormField }: DescriptionProps) => {
	const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
	const [isEditingDescription, setIsEditingDescription] = useState(false)
	const [localDescription, setLocalDescription] = useState('')

	const handleOpen = (editMode: boolean) => {
		setLocalDescription(form.description || '')
		setIsEditingDescription(editMode)
		setIsDescriptionOpen(true)
	}

	const handleSave = () => {
		const value = localDescription.trim() === '' ? undefined : localDescription.trim()
		setFormField('description', value)
		setIsEditingDescription(false)
		setIsDescriptionOpen(false)
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSave()
		}
	}

	return (
		<div className={classes.description}>
			<div className={classes.icon}>
				<DescriptionIcon />
			</div>
			{!form.description ? (
				<button
					className={classes.addButton}
					onClick={() => handleOpen(true)}
					type='button'
				>
					Add description
				</button>
			) : (
				<button className={classes.addButton} onClick={() => handleOpen(false)} type='button'>
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
						<div className={classes.modal}>
							<h3 className={classes.title}>Event Description</h3>
							<textarea
								className={classes.descriptionTextarea}
								placeholder='Add a description (Enter to save)'
								value={localDescription}
								onChange={e => setLocalDescription(e.target.value)}
								onKeyDown={handleKeyDown}
								autoFocus
								rows={4}
							/>
							<div className={classes.buttons}>
								<button
									type='button'
									className={classes.cancelButton}
									onClick={() => {
										setIsEditingDescription(false)
										setIsDescriptionOpen(false)
									}}
								>
									Cancel
								</button>
								<button
									type='button'
									className={classes.confirmButton}
									onClick={handleSave}
								>
									Save
								</button>
							</div>
						</div>
					) : (
						<div className={classes.modal}>
							<h3 className={classes.title}>Event Description</h3>
							<div className={classes.descriptionContent} onClick={() => setIsEditingDescription(true)}>
								<p className={classes.descriptionText}>{localDescription || 'No description added yet. Click to edit.'}</p>
							</div>
							<div className={classes.buttons}>
								<button
									type='button'
									className={classes.cancelButton}
									onClick={() => {
										setIsDescriptionOpen(false)
									}}
								>
									Close
								</button>
								<button
									type='button'
									className={classes.confirmButton}
									onClick={() => setIsEditingDescription(true)}
								>
									Edit
								</button>
							</div>
						</div>
					)}
				</Modal>
			)}
		</div>
	)
}
