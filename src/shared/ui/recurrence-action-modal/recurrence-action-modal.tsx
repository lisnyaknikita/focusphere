'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import classes from './recurrence-action-modal.module.scss'

export type RecurrenceScope = 'this' | 'all'

interface RecurrenceActionModalProps {
	isVisible: boolean
	actionType: 'delete' | 'edit'
	eventTitle?: string
	onClose: () => void
	onConfirm: (scope: RecurrenceScope) => void
}

export const RecurrenceActionModal = ({
	isVisible,
	actionType,
	eventTitle,
	onClose,
	onConfirm,
}: RecurrenceActionModalProps) => {
	const [scope, setScope] = useState<RecurrenceScope>('this')

	const isDelete = actionType === 'delete'
	const title = isDelete ? 'Delete recurring event' : 'Edit recurring event'

	const handleConfirm = () => {
		onConfirm(scope)
		onClose()
	}

	return (
		<Modal isVisible={isVisible} onClose={onClose} className={classes.recurrenceActionModal}>
			<div className={classes.content}>
				<h3>{title}</h3>
				{eventTitle && (
					<p className={classes.eventTitle}>
						&quot;<span>{eventTitle}</span>&quot;
					</p>
				)}
				<p className={classes.description}>
					This event is part of a recurring series. Which occurrences would you like to {actionType}?
				</p>

				<div className={classes.options}>
					<label className={classes.optionLabel}>
						<input
							type='radio'
							name='recurrenceScope'
							value='this'
							checked={scope === 'this'}
							onChange={() => setScope('this')}
						/>
						<div className={classes.optionText}>
							<strong>This event only</strong>
							<span>Affects only this specific occurrence</span>
						</div>
					</label>

					<label className={classes.optionLabel}>
						<input
							type='radio'
							name='recurrenceScope'
							value='all'
							checked={scope === 'all'}
							onChange={() => setScope('all')}
						/>
						<div className={classes.optionText}>
							<strong>All events in series</strong>
							<span>Affects all past and future occurrences</span>
						</div>
					</label>
				</div>
			</div>

			<div className={classes.actions}>
				<button type='button' className={classes.cancelButton} onClick={onClose}>
					Cancel
				</button>
				<button
					type='button'
					className={isDelete ? classes.deleteButton : classes.confirmButton}
					onClick={handleConfirm}
					autoFocus
				>
					{isDelete ? 'Delete' : 'Save'}
				</button>
			</div>
		</Modal>
	)
}
