'use client'

import { ChatChannel } from '@/shared/types/chat'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { ChannelIcon } from '@/shared/ui/icons/projects/channel-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { Models } from 'appwrite'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import classes from './chat-sidebar.module.scss'
import { CreateChannelModal } from './components/create-channel-modal/create-channel-modal'

interface ChatSidebarProps {
	teammates: Models.Membership[]
	channels: ChatChannel[]
	activeChannelId?: string
	onSelectChannel: (channel: ChatChannel) => void
	onCreateChannel: (name: string, ownerId: string) => Promise<void>
	currentUserId?: string
	isMobileOpen: boolean
	onMobileClose: () => void
}

export const ChatSidebar = ({
	teammates,
	channels,
	activeChannelId,
	onSelectChannel,
	onCreateChannel,
	currentUserId,
	isMobileOpen,
	onMobileClose,
}: ChatSidebarProps) => {
	const [isChannelsOpened, setIsChannelsOpened] = useState(true)
	// const [isMessagesOpened, setIsMessagesOpened] = useState(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [newChannelName, setNewChannelName] = useState('')
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	console.log(teammates)

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

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

	const handleOpenCreateModal = () => {
		setIsCreateModalOpen(true)
		setIsTooltipOpen(false)
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
						<button
							ref={refs.setReference}
							className={classes.createButton}
							onClick={handleOpenCreateModal}
							{...getReferenceProps()}
						>
							<PlusIcon />
							{isTooltipOpen && (
								<div
									ref={refs.setFloating}
									style={{
										...floatingStyles,
										background: 'var(--save-button-bg)',
										color: 'var(--save-button-text)',
										padding: '4px 8px',
										borderRadius: '5px',
										fontSize: '13px',
										fontWeight: 700,
										zIndex: 1000,
										whiteSpace: 'nowrap',
									}}
									{...getFloatingProps()}
								>
									Create channel
								</div>
							)}
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
				{/* <div className={classes.messages}>
					<div className={classes.trigger} onClick={() => setIsMessagesOpened(prev => !prev)}>
						<button className={classes.triggerTitle}>
							<ArrowBottomIcon className={clsx(!isMessagesOpened && 'rotated')} />
							<span>Direct messages</span>
						</button>
						<button className={clsx(classes.createButton)}>
							<PlusIcon />
						</button>
					</div>
					<ul className={clsx(classes.list, isMessagesOpened && 'opened')}> */}
				{/* {teammates.map(mate => (
					<li className={classes.listItem} key={mate.$id}>
						<Image src={'/avatar.jpg'} alt='avatar' width={20} height={19} />
						<span>{mate.userName}</span>
					</li>
				))} */}
				{/* <p>Soon...</p>
					</ul>
				</div> */}
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
