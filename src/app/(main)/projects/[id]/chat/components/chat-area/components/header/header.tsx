'use client'

import { ChatChannel } from '@/shared/types/chat'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { ChannelIcon } from '@/shared/ui/icons/projects/channel-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { ChannelInfoModal } from './components/channel-info-modal/channel-info-modal'
import classes from './header.module.scss'

interface HeaderProps {
	activeChannel: ChatChannel | null
	onUpdateChannel: (id: string, name: string) => Promise<void>
	onDeleteChannel: (id: string) => Promise<void>
	currentUserId: string | undefined
}

export const Header = ({ activeChannel, onUpdateChannel, onDeleteChannel, currentUserId }: HeaderProps) => {
	const [isChannelInfoOpened, setIsChannelInfoOpened] = useState(false)
	const isOwner = activeChannel?.ownerId === currentUserId

	if (!activeChannel) return <header className={classes.header} />

	return (
		<>
			<header className={classes.header}>
				<button className={classes.channelTrigger} onClick={() => setIsChannelInfoOpened(true)}>
					<ChannelIcon />
					<span>{activeChannel.name}</span>
					<ArrowBottomIcon />
				</button>
			</header>
			<Modal isVisible={isChannelInfoOpened} onClose={() => setIsChannelInfoOpened(false)}>
				<ChannelInfoModal
					channel={activeChannel}
					onClose={() => setIsChannelInfoOpened(false)}
					onUpdate={onUpdateChannel}
					onDelete={onDeleteChannel}
					isOwner={isOwner}
				/>
			</Modal>
		</>
	)
}
