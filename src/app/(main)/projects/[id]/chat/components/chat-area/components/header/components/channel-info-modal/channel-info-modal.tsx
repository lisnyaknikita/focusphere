import { ChatChannel } from '@/shared/types/chat'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CloseButtonIcon } from '@/shared/ui/icons/calendar/close-button-icon'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { useState } from 'react'
import classes from './channel-info-modal.module.scss'

interface ChannelInfoModalProps {
	onClose: () => void
	channel: ChatChannel
	onUpdate: (id: string, name: string) => Promise<void>
	onDelete: (id: string) => Promise<void>
	isOwner: boolean
}

export const ChannelInfoModal = ({ onClose, channel, onUpdate, onDelete, isOwner }: ChannelInfoModalProps) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState(channel.name)

	const handleUpdate = async () => {
		if (editName.trim() && editName !== channel.name) {
			await onUpdate(channel.$id, editName)
		}
		setIsEditing(false)
	}

	const handleDelete = async () => {
		await onDelete(channel.$id)
		setIsConfirmOpen(false)
		onClose()
	}

	return (
		<>
			<div className={classes.modalInner}>
				<div className={classes.channelTitle}>#{channel.name}</div>
				{isEditing ? (
					<input
						className={classes.input}
						value={editName}
						onChange={e => setEditName(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.currentTarget.blur()
							}
						}}
						onBlur={handleUpdate}
						autoFocus
					/>
				) : (
					<button
						className={classes.editButton}
						onClick={() => setIsEditing(true)}
						disabled={!isOwner}
						title={!isOwner ? 'Only the owner can edit this channel' : 'Edit'}
					>
						<div className={classes.channelName}>
							<p>Channel name</p>
							<span>#{channel.name}</span>
						</div>
						<div className={classes.editText}>Edit</div>
					</button>
				)}
				<button className={classes.deleteButton} onClick={() => setIsConfirmOpen(true)} disabled={!isOwner}>
					<DeleteIcon width={18} height={18} />
					<span>Delete channel</span>
				</button>
				<button className={classes.closeButton} onClick={() => onClose()}>
					<CloseButtonIcon />
				</button>
			</div>
			<ConfirmModal
				isVisible={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
				title='Delete Channel'
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{channel.name || 'this channel'}</span>
						&quot;?
					</>
				}
			/>
		</>
	)
}
