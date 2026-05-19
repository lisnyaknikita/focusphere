'use client'

import { ChatChannel } from '@/shared/types/chat'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { ChannelIcon } from '@/shared/ui/icons/projects/channel-icon'
import { SidebarIcon } from '@/shared/ui/icons/sidebar-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { ChannelInfoModal } from './components/channel-info-modal/channel-info-modal'
import classes from './header.module.scss'

interface HeaderProps {
	activeChannel: ChatChannel | null
	onUpdateChannel: (id: string, name: string) => Promise<void>
	onDeleteChannel: (id: string) => Promise<void>
	currentUserId: string | undefined
	onOpenChatSidebar: () => void
	displayName?: string
}

export const Header = ({
	activeChannel,
	onUpdateChannel,
	onDeleteChannel,
	currentUserId,
	onOpenChatSidebar,
	displayName,
}: HeaderProps) => {
	const [isChannelInfoOpened, setIsChannelInfoOpened] = useState(false)
	const isOwner = activeChannel?.ownerId === currentUserId
	const isDM = activeChannel?.type === 'dm'

	return (
		<>
			<header className={classes.header}>
				<button className={classes.sidebarToggle} onClick={onOpenChatSidebar} aria-label='Open channels sidebar'>
					<SidebarIcon />
				</button>

				{activeChannel && (
					<button className={classes.channelTrigger} onClick={() => !isDM && setIsChannelInfoOpened(true)}>
						<ChannelIcon />
						<span>{displayName ?? activeChannel.name}</span>
						{!isDM && <ArrowBottomIcon />}
					</button>
				)}
			</header>

			{activeChannel && !isDM && (
				<Modal isVisible={isChannelInfoOpened} onClose={() => setIsChannelInfoOpened(false)}>
					<ChannelInfoModal
						channel={activeChannel}
						onClose={() => setIsChannelInfoOpened(false)}
						onUpdate={onUpdateChannel}
						onDelete={onDeleteChannel}
						isOwner={isOwner}
					/>
				</Modal>
			)}
		</>
	)
}
