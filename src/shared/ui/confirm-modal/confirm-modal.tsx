import { useCalendarOperationStore } from '@/shared/stores/calendar-operation.store'
import { useCallback, useEffect } from 'react'
import { Modal } from '../modal/modal'
import classes from './confirm-modal.module.scss'

interface ConfirmModalProps {
	isVisible: boolean
	title?: string
	message: React.ReactNode
	confirmText?: string
	cancelText?: string
	onConfirm: () => void
	onClose: () => void
}

export const ConfirmModal = ({
	isVisible,
	title = 'Confirmation',
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onClose,
}: ConfirmModalProps) => {
	const isMutating = useCalendarOperationStore(state => state.isMutating)

	const handleConfirm = useCallback(() => {
		if (isMutating) return
		onConfirm()
		onClose()
	}, [onConfirm, onClose, isMutating])

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isVisible && event.key === 'Enter') {
				event.preventDefault()
				handleConfirm()
			}
		}

		if (isVisible) {
			window.addEventListener('keydown', handleKeyDown)
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isVisible, handleConfirm])

	return (
		<Modal isVisible={isVisible} onClose={onClose} className={classes.confirmModal}>
			<div className={classes.content}>
				<h3>{title}</h3>
				<p>{message}</p>
			</div>
			<div className={classes.actions}>
				<button type='button' className={classes.cancelButton} onClick={onClose} disabled={isMutating}>
					{cancelText}
				</button>
				<button type='button' className={classes.confirmButton} onClick={handleConfirm} disabled={isMutating} autoFocus>
					{isMutating ? 'Deleting…' : confirmText}
				</button>
			</div>
		</Modal>
	)
}
