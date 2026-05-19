'use client'

import { useProject } from '@/shared/context/project-context'
import { useAvatarUrl } from '@/shared/hooks/avatar-url/use-avatar-url'
import { useChat } from '@/shared/hooks/projects/chat/use-chat'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useState } from 'react'
import { ChatArea } from './components/chat-area/chat-area'
import { ChatSidebar } from './components/chat-sidebar/chat-sidebar'
import classes from './page.module.scss'

export default function ChatPage() {
	const { user, loading: userLoading } = useUser()
	const { project, isLoading: projectLoading } = useProject()

	const { avatarUrl } = useAvatarUrl(user)

	const chat = useChat(project!)

	const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false)

	if (userLoading || projectLoading) return <div>Loading...</div>
	if (!project) return <div>Project not found</div>

	const handleSendMessage = (content: string, replyToMessageId?: string) => {
		if (!user) return

		chat.sendMessage(content, user.$id, user.name, avatarUrl || undefined, replyToMessageId)
	}

	return (
		<div className={classes.chatPage}>
			<div className={classes.inner}>
				<ChatSidebar
					teammates={chat.teammates}
					channels={chat.channels}
					activeChannelId={chat.activeChannel?.$id}
					onSelectChannel={channel => {
						chat.setActiveChannel(channel)
						setIsChatSidebarOpen(false)
					}}
					onCreateChannel={chat.createChannel}
					currentUserId={user?.$id}
					isMobileOpen={isChatSidebarOpen}
					onMobileClose={() => setIsChatSidebarOpen(false)}
				/>
				<ChatArea
					activeChannel={chat.activeChannel}
					messages={chat.messages}
					teammates={chat.teammates}
					onSendMessage={handleSendMessage}
					onUpdateMessage={chat.updateMessage}
					onDeleteMessage={chat.deleteMessage}
					onUpdateChannel={chat.updateChannel}
					onDeleteChannel={chat.deleteChannel}
					currentUserId={user?.$id}
					currentUserName={user?.name}
					isLoading={chat.isLoadingMessages}
					onOpenChatSidebar={() => setIsChatSidebarOpen(true)}
				/>
			</div>
		</div>
	)
}
