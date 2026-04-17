import { ChatMessage } from '@/shared/types/chat'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { stripHtml } from '@/shared/utils/strip-html/strip-html'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'
import classes from './action-buttons.module.scss'

interface ActionButtonsProps {
	message: ChatMessage
	isAuthor: boolean
	isEditing: boolean
	setIsEditing: Dispatch<SetStateAction<boolean>>
	setEditValue: Dispatch<SetStateAction<string>>
	setIsDeleteConfirmModalOpen: Dispatch<SetStateAction<boolean>>
}

export const ActionButtons = ({
	message,
	isAuthor,
	isEditing,
	setIsEditing,
	setEditValue,
	setIsDeleteConfirmModalOpen,
}: ActionButtonsProps) => {
	const [isEditTooltipOpen, setIsEditTooltipOpen] = useState(false)
	const [isDeleteTooltipOpen, setIsDeleteTooltipOpen] = useState(false)

	const canEdit = isAuthor
	const canDelete = isAuthor

	const {
		refs: editRefs,
		floatingStyles: editStyles,
		context: editContext,
	} = useFloating({
		open: isEditTooltipOpen,
		onOpenChange: setIsEditTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const {
		refs: deleteRefs,
		floatingStyles: deleteStyles,
		context: deleteContext,
	} = useFloating({
		open: isDeleteTooltipOpen,
		onOpenChange: setIsDeleteTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const editHover = useHover(editContext)
	const deleteHover = useHover(deleteContext)

	const { getReferenceProps: getEditProps, getFloatingProps: getEditFloatingProps } = useInteractions([editHover])
	const { getReferenceProps: getDeleteProps, getFloatingProps: getDeleteFloatingProps } = useInteractions([deleteHover])

	const handleStartEditing = () => {
		setEditValue(stripHtml(message.content))
		setIsEditing(true)
		setIsEditTooltipOpen(false)
	}

	const handleDeleteClick = () => {
		setIsDeleteConfirmModalOpen(true)
		setIsDeleteTooltipOpen(false)
	}

	return (
		<div className={classes.actionButtons} data-action-buttons>
			{canEdit && !isEditing && (
				<button
					ref={editRefs.setReference}
					className={classes.editButton}
					onClick={handleStartEditing}
					{...getEditProps()}
				>
					<EditIcon />
					{isEditTooltipOpen && (
						<div
							ref={editRefs.setFloating}
							style={{
								...editStyles,
								background: 'var(--save-button-bg)',
								color: 'var(--save-button-text)',
								padding: '4px 8px',
								borderRadius: '5px',
								fontSize: '12px',
								fontWeight: 700,
								zIndex: 1000,
								whiteSpace: 'nowrap',
							}}
							{...getEditFloatingProps()}
						>
							Edit message
						</div>
					)}
				</button>
			)}
			{canDelete && !isEditing && (
				<button
					ref={deleteRefs.setReference}
					className={classes.deleteButton}
					onClick={handleDeleteClick}
					{...getDeleteProps()}
				>
					<DeleteIcon />
					{isDeleteTooltipOpen && (
						<div
							ref={deleteRefs.setFloating}
							style={{
								...deleteStyles,
								background: 'var(--save-button-bg)',
								color: 'var(--save-button-text)',
								padding: '4px 8px',
								borderRadius: '5px',
								fontSize: '12px',
								fontWeight: 700,
								zIndex: 1000,
								whiteSpace: 'nowrap',
							}}
							{...getDeleteFloatingProps()}
						>
							Delete message
						</div>
					)}
				</button>
			)}
		</div>
	)
}
