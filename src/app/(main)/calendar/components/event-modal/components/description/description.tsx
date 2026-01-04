import { EventForm } from '@/shared/types/event'
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
				<svg width='22' height='22' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M13.3333 0H2.66667C1.95942 0 1.28115 0.280952 0.781049 0.781049C0.280952 1.28115 0 1.95942 0 2.66667L0 10.6667C0 11.3739 0.280952 12.0522 0.781049 12.5523C1.28115 13.0524 1.95942 13.3333 2.66667 13.3333H4.6L7.56733 15.842C7.68771 15.9439 7.8403 15.9998 7.998 15.9998C8.1557 15.9998 8.30829 15.9439 8.42867 15.842L11.4 13.3333H13.3333C14.0406 13.3333 14.7189 13.0524 15.219 12.5523C15.719 12.0522 16 11.3739 16 10.6667V2.66667C16 1.95942 15.719 1.28115 15.219 0.781049C14.7189 0.280952 14.0406 0 13.3333 0ZM14.6667 10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H11.4C11.0849 12.0001 10.7799 12.1118 10.5393 12.3153L8 14.46L5.462 12.3153C5.22104 12.1115 4.9156 11.9998 4.6 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H13.3333C13.687 1.33333 14.0261 1.47381 14.2761 1.72386C14.5262 1.97391 14.6667 2.31304 14.6667 2.66667V10.6667Z'
						fill='white'
					/>
					<path
						d='M4.66667 4.66659H8C8.17681 4.66659 8.34638 4.59635 8.4714 4.47132C8.59643 4.3463 8.66667 4.17673 8.66667 3.99992C8.66667 3.82311 8.59643 3.65354 8.4714 3.52851C8.34638 3.40349 8.17681 3.33325 8 3.33325H4.66667C4.48986 3.33325 4.32029 3.40349 4.19526 3.52851C4.07024 3.65354 4 3.82311 4 3.99992C4 4.17673 4.07024 4.3463 4.19526 4.47132C4.32029 4.59635 4.48986 4.66659 4.66667 4.66659Z'
						fill='white'
					/>
					<path
						d='M11.3333 6H4.66667C4.48986 6 4.32029 6.07024 4.19526 6.19526C4.07024 6.32029 4 6.48986 4 6.66667C4 6.84348 4.07024 7.01305 4.19526 7.13807C4.32029 7.2631 4.48986 7.33333 4.66667 7.33333H11.3333C11.5101 7.33333 11.6797 7.2631 11.8047 7.13807C11.9298 7.01305 12 6.84348 12 6.66667C12 6.48986 11.9298 6.32029 11.8047 6.19526C11.6797 6.07024 11.5101 6 11.3333 6Z'
						fill='white'
					/>
					<path
						d='M11.3333 8.66675H4.66667C4.48986 8.66675 4.32029 8.73699 4.19526 8.86201C4.07024 8.98703 4 9.1566 4 9.33341C4 9.51023 4.07024 9.67979 4.19526 9.80482C4.32029 9.92984 4.48986 10.0001 4.66667 10.0001H11.3333C11.5101 10.0001 11.6797 9.92984 11.8047 9.80482C11.9298 9.67979 12 9.51023 12 9.33341C12 9.1566 11.9298 8.98703 11.8047 8.86201C11.6797 8.73699 11.5101 8.66675 11.3333 8.66675Z'
						fill='white'
					/>
				</svg>
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
