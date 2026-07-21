'use client'

import { ChatChannel, TeamMember } from '@/shared/types/chat'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { ChannelIcon } from '@/shared/ui/icons/projects/channel-icon'
import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import classes from './chat-sidebar.module.scss'
import { CreateChannelModal } from './components/create-channel-modal/create-channel-modal'

interface ChatSidebarProps {
	teammates: TeamMember[]
	channels: ChatChannel[]
	dmChannels: ChatChannel[]
	activeChannelId?: string
	onSelectChannel: (channel: ChatChannel) => void
	onCreateChannel: (name: string, ownerId: string) => Promise<void>
	currentUserId?: string
	isMobileOpen: boolean
	onMobileClose: () => void
	onOpenDM: (currentUserId: string, targetMember: TeamMember) => void
	unreadChannelIds: Set<string>
}

export const ChatSidebar = ({
	teammates,
	channels,
	dmChannels,
	activeChannelId,
	onSelectChannel,
	onCreateChannel,
	currentUserId,
	isMobileOpen,
	onMobileClose,
	onOpenDM,
	unreadChannelIds,
}: ChatSidebarProps) => {
	const [isChannelsOpened, setIsChannelsOpened] = useState(true)
	const [isMessagesOpened, setIsMessagesOpened] = useState(true)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [newChannelName, setNewChannelName] = useState('')

	const safeTeammates = Array.isArray(teammates) ? teammates : ([] as TeamMember[])

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newChannelName.trim() || !currentUserId) return

		try {
			await onCreateChannel(newChannelName.trim(), currentUserId)
			setNewChannelName('')
			setIsCreateModalOpen(false)
		} catch (err: unknown) {
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
			<div
				className={clsx(classes.mobileOverlay, isMobileOpen && classes.mobileOverlayVisible)}
				onClick={onMobileClose}
			/>
			<div className={clsx(classes.sidebar, isMobileOpen && classes.mobileOpen)}>
				<div className={classes.channels}>
					<div className={classes.trigger}>
						<button className={classes.triggerTitle} onClick={() => setIsChannelsOpened(prev => !prev)}>
							<ArrowBottomIcon className={clsx(!isChannelsOpened && 'rotated')} />
							<span>Channels</span>
						</button>
						<ActionTooltip text='Create channel'>
							{(setRef, refProps) => (
								<button
									ref={setRef}
									type='button'
									className={classes.createButton}
									onClick={() => setIsCreateModalOpen(true)}
									{...refProps}
								>
									<PlusIcon />
								</button>
							)}
						</ActionTooltip>
					</div>
					<ul className={clsx(classes.list, isChannelsOpened && 'opened')}>
						{channels.map(channel => (
							<li
								className={clsx(classes.listItem, channel.$id === activeChannelId && 'active')}
								key={channel.$id}
								onClick={() => onSelectChannel(channel)}
								title={channel.name}
							>
								<ChannelIcon />
								<span>{channel.name}</span>
								{unreadChannelIds.has(channel.$id) && (
									<span className={classes.unreadBadge} aria-label='Unread messages' />
								)}
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
					</div>
					<ul className={clsx(classes.list, isMessagesOpened && 'opened')}>
						{safeTeammates
							.filter(m => m.userId !== currentUserId)
							.map((mate: TeamMember) => {
								const existingDM = currentUserId
									? dmChannels.find(
											ch => ch.dmParticipants?.includes(currentUserId) && ch.dmParticipants?.includes(mate.userId)
									  )
									: null

								const isActive = existingDM?.$id === activeChannelId

								return (
									<li
										className={clsx(classes.listItem, isActive && 'active')}
										key={mate.$id}
										onClick={() => {
											if (currentUserId) {
												onOpenDM(currentUserId, mate)
											}
										}}
									>
										<span>{mate.userName}</span>
										{existingDM && unreadChannelIds.has(existingDM.$id) && (
											<span className={classes.unreadBadge} aria-label='Unread messages' />
										)}
									</li>
								)
							})}
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
