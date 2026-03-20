'use client'

import { ChatChannel } from '@/shared/types/chat'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { ChannelIcon } from '@/shared/ui/icons/projects/channel-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { Models } from 'appwrite'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import classes from './chat-sidebar.module.scss'
import { CreateChannelModal } from './components/create-channel-modal/create-channel-modal'

interface ChatSidebarProps {
	teammates: Models.Membership[]
	projectTitle: string
	channels: ChatChannel[]
	activeChannelId?: string
	onSelectChannel: (channel: ChatChannel) => void
	onCreateChannel: (name: string, ownerId: string) => Promise<void>
	currentUserId?: string
}

export const ChatSidebar = ({
	teammates,
	projectTitle,
	channels,
	activeChannelId,
	onSelectChannel,
	onCreateChannel,
	currentUserId,
}: ChatSidebarProps) => {
	const [isChannelsOpened, setIsChannelsOpened] = useState(true)
	const [isMessagesOpened, setIsMessagesOpened] = useState(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [newChannelName, setNewChannelName] = useState('')
	console.log(teammates)

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newChannelName.trim() || !currentUserId) return

		try {
			await onCreateChannel(newChannelName.trim(), currentUserId)
			setNewChannelName('')
			setIsCreateModalOpen(false)
		} catch (err) {
			console.error('Create channel UI error:', err)
		}
	}

	useEffect(() => {
		if (channels.length === 0) {
			setIsChannelsOpened(false)
		} else {
			setIsChannelsOpened(true)
		}
	}, [channels])

	return (
		<>
			<div className={classes.sidebar}>
				<h3 className={classes.title}>{projectTitle}</h3>
				<div className={classes.channels}>
					<div className={classes.trigger}>
						<button className={classes.triggerTitle} onClick={() => setIsChannelsOpened(prev => !prev)}>
							<ArrowBottomIcon className={clsx(!isChannelsOpened && 'rotated')} />
							<span>Channels</span>
						</button>
						<button className={classes.createButton} onClick={() => setIsCreateModalOpen(true)}>
							<PlusIcon />
						</button>
					</div>
					<ul className={clsx(classes.list, isChannelsOpened && 'opened')}>
						{channels.map(channel => (
							<li
								className={clsx(classes.listItem, channel.$id === activeChannelId && 'active')}
								key={channel.$id}
								onClick={() => onSelectChannel(channel)}
							>
								<ChannelIcon />
								<span>{channel.name}</span>
							</li>
						))}
					</ul>
				</div>
				<div className={classes.messages}>
					<div className={classes.trigger} onClick={() => setIsMessagesOpened(prev => !prev)}>
						<button className={classes.triggerTitle}>
							<ArrowBottomIcon className={clsx(!isMessagesOpened && 'rotated')} />
							<span>Direct messages</span>
						</button>
						<button className={clsx(classes.createButton)}>
							<PlusIcon />
						</button>
					</div>
					<ul className={clsx(classes.list, isMessagesOpened && 'opened')}>
						{/* {teammates.map(mate => (
						<li className={classes.listItem} key={mate.$id}>
							<Image src={'/avatar.jpg'} alt='avatar' width={20} height={19} />
							<span>{mate.userName}</span>
						</li>
					))} */}
						<p>Soon...</p>
					</ul>
				</div>
			</div>
			<Modal isVisible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
				<CreateChannelModal
					onCreate={handleCreateSubmit}
					newChannelName={newChannelName}
					setNewChannelName={setNewChannelName}
					onClose={() => setIsCreateModalOpen(false)}
				/>
			</Modal>
		</>
	)
}
