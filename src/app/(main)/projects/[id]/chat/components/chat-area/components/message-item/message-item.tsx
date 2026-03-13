import { ChatMessage } from '@/shared/types/chat'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { Models } from 'appwrite'
import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'
import { ActionButtons } from './components/action-buttons/action-buttons'
import { MessageContent } from './components/message-content/message-content'
import classes from './message-item.module.scss'

interface MessageItemProps {
	isContinuation: boolean
	message: ChatMessage
	teammates?: Models.Membership[]
	currentUserId: string | undefined
	currentUserName?: string
	onUpdate: (id: string, content: string) => void
	onDelete: (id: string) => void
}

export const MessageItem = ({
	isContinuation,
	message,
	teammates = [],
	currentUserId,
	currentUserName,
	onUpdate,
	onDelete,
}: MessageItemProps) => {
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(message.content)

	const currentAuthor = teammates?.find?.(m => m.userId === message.senderId)

	const displayAvatar = message.senderAvatar || '/avatar.jpg'

	const isAuthor = currentUserId === message.senderId
	const isEdited = message.isEdited

	const displayName = isAuthor ? currentUserName || message.senderName : currentAuthor?.userName || message.senderName

	const handleConfirmMessageDelete = () => {
		onDelete(message.$id)
		setIsDeleteConfirmModalOpen(false)
	}

	return (
		<>
			<div className={clsx(classes.message, isContinuation && 'continuation')} key={message.$id}>
				{!isContinuation ? (
					<div className={classes.authorAvatar}>
						<Image src={displayAvatar} alt='avatar' width={46} height={46} />
					</div>
				) : (
					<div className={classes.avatarPlaceholder} />
				)}
				<MessageContent
					isContinuation={isContinuation}
					isEdited={isEdited}
					isEditing={isEditing}
					editValue={editValue}
					message={message}
					displayName={displayName}
					onUpdate={onUpdate}
					setEditValue={setEditValue}
					setIsEditing={setIsEditing}
				/>
				<ActionButtons
					message={message}
					isAuthor={isAuthor}
					isEditing={isEditing}
					setIsEditing={setIsEditing}
					setEditValue={setEditValue}
					setIsDeleteConfirmModalOpen={setIsDeleteConfirmModalOpen}
				/>
			</div>
			<ConfirmModal
				isVisible={isDeleteConfirmModalOpen}
				onClose={() => setIsDeleteConfirmModalOpen(false)}
				onConfirm={handleConfirmMessageDelete}
				title='Delete message'
				message='Are you sure you want to delete this message?'
			/>
		</>
	)
}
