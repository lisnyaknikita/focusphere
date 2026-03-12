import { Dispatch, SetStateAction } from 'react'
import classes from './create-channel-modal.module.scss'

interface CreateChannelModalProps {
	onCreate: (e: React.FormEvent) => Promise<void>
	newChannelName: string
	setNewChannelName: Dispatch<SetStateAction<string>>
	onClose: () => void
}

export const CreateChannelModal = ({
	onCreate,
	newChannelName,
	setNewChannelName,
	onClose,
}: CreateChannelModalProps) => {
	return (
		<div className={classes.modalInner}>
			<form className={classes.newChannelModal} onSubmit={onCreate}>
				<div className={classes.inputWrapper}>
					<input
						className={classes.channelName}
						placeholder='e.g. marketing'
						value={newChannelName}
						onChange={e => setNewChannelName(e.target.value)}
						autoFocus
					/>
				</div>
				<div className={classes.buttons}>
					<button type='submit' className={classes.confirmButton} disabled={!newChannelName.trim()}>
						Create channel
					</button>
					<button type='button' className={classes.cancelButton} onClick={onClose}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}
