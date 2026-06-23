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
	onToggleChatSidebar: () => void
	displayName?: string
}

export const Header = ({
	activeChannel,
	onUpdateChannel,
	onDeleteChannel,
	currentUserId,
	onToggleChatSidebar,
	displayName,
}: HeaderProps) => {
	const [isChannelInfoOpened, setIsChannelInfoOpened] = useState(false)

	const isOwner = activeChannel?.ownerId === currentUserId
	const isDM = activeChannel?.type === 'dm'
	const channelTitle = displayName ?? activeChannel?.name

	return (
		<>
			<header className={classes.header}>
				<button
					className={classes.sidebarToggle}
					onClick={onToggleChatSidebar}
					aria-label='Open channels sidebar'
					type='button'
				>
					<SidebarIcon />
				</button>

				{activeChannel &&
					(isDM ? (
						<div className={classes.channelTrigger}>
							<ChannelIcon />
							<span>{channelTitle}</span>
						</div>
					) : (
						<button type='button' className={classes.channelTrigger} onClick={() => setIsChannelInfoOpened(true)}>
							<ChannelIcon />
							<span>{channelTitle}</span>
							<ArrowBottomIcon />
						</button>
					))}
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
