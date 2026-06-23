import { ChatMessage } from '@/shared/types/chat'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { ReplyIcon } from '@/shared/ui/icons/reply-icon'
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
	onReply: (message: ChatMessage) => void
}

export const ActionButtons = ({
	message,
	isAuthor,
	isEditing,
	setIsEditing,
	setEditValue,
	setIsDeleteConfirmModalOpen,
	onReply,
}: ActionButtonsProps) => {
	const canEdit = isAuthor
	const canDelete = isAuthor

	const handleStartEditing = () => {
		setEditValue(stripHtml(message.content))
		setIsEditing(true)
	}

	return (
		<div className={classes.actionButtons} data-action-buttons>
			{!isEditing && (
				<ActionTooltip text='Reply to message'>
					{(setRef, refProps) => (
						<button
							ref={setRef}
							type='button'
							className={classes.replyButton}
							onClick={() => onReply(message)}
							{...refProps}
						>
							<ReplyIcon />
						</button>
					)}
				</ActionTooltip>
			)}
			{canEdit && !isEditing && (
				<ActionTooltip text='Edit message'>
					{(setRef, refProps) => (
						<button
							ref={setRef}
							type='button'
							className={classes.editButton}
							onClick={handleStartEditing}
							{...refProps}
						>
							<EditIcon />
						</button>
					)}
				</ActionTooltip>
			)}
			{canDelete && !isEditing && (
				<ActionTooltip text='Delete message'>
					{(setRef, refProps) => (
						<button
							ref={setRef}
							type='button'
							className={classes.deleteButton}
							onClick={() => setIsDeleteConfirmModalOpen(true)}
							{...refProps}
						>
							<DeleteIcon />
						</button>
					)}
				</ActionTooltip>
			)}
		</div>
	)
}
