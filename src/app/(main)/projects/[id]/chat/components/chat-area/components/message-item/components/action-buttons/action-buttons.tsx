import { ChatMessage } from '@/shared/types/chat'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { stripHtml } from '@/shared/utils/strip-html/strip-html'
import { Dispatch, SetStateAction } from 'react'
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
	const canEdit = isAuthor
	const canDelete = isAuthor

	const handleStartEditing = () => {
		setEditValue(stripHtml(message.content))
		setIsEditing(true)
	}

	return (
		<div className={classes.actionButtons} data-action-buttons>
			{canEdit && !isEditing && (
				<button className={classes.editButton} onClick={handleStartEditing}>
					<EditIcon />
				</button>
			)}
			{canDelete && !isEditing && (
				<button className={classes.deleteButton} onClick={() => setIsDeleteConfirmModalOpen(true)}>
					<DeleteIcon />
				</button>
			)}
		</div>
	)
}
