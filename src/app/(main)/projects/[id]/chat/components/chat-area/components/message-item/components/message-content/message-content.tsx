import { ChatMessage } from '@/shared/types/chat'
import { Dispatch, SetStateAction } from 'react'
import classes from './message-content.module.scss'

interface MessageContentProps {
	isContinuation: boolean
	isEdited: boolean | undefined
	isEditing: boolean
	editValue: string
	message: ChatMessage
	displayName: string
	onUpdate: (id: string, content: string) => void
	setEditValue: Dispatch<SetStateAction<string>>
	setIsEditing: Dispatch<SetStateAction<boolean>>
}

export const MessageContent = ({
	isContinuation,
	isEdited,
	isEditing,
	editValue,
	message,
	displayName,
	onUpdate,
	setEditValue,
	setIsEditing,
}: MessageContentProps) => {
	const handleUpdate = () => {
		if (editValue.trim() !== '' && editValue !== message.content) {
			onUpdate(message.$id, editValue)
		}
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleUpdate()
		}
		if (e.key === 'Escape') {
			setEditValue(message.content)
			setIsEditing(false)
		}
	}

	return (
		<div className={classes.messageContent}>
			{!isContinuation && (
				<div className={classes.messageHeader}>
					<div className={classes.name}>{displayName}</div>
					<time>
						{new Date(message.$createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</time>
					{isEdited && <span className={classes.editedMessage}>(edited)</span>}
				</div>
			)}
			<div className={classes.messageText}>
				{isEditing ? (
					<input
						autoFocus
						className={classes.editInput}
						value={editValue}
						onChange={e => setEditValue(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={() => setIsEditing(false)}
					/>
				) : (
					<div dangerouslySetInnerHTML={{ __html: message.content }} />
				)}
			</div>
		</div>
	)
}
