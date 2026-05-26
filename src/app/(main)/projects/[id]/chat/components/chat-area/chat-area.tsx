import { ChatChannel, ChatMessage, TeamMember } from '@/shared/types/chat'
import { KanbanTask } from '@/shared/types/kanban-task'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { formatDividerDate } from '@/shared/utils/format-divider-date/format-divider-date'
import { stripHtml } from '@/shared/utils/strip-html/strip-html'
import { useEffect, useRef, useState } from 'react'
import classes from './chat-area.module.scss'
import { Editor, EditorRef } from './components/editor/editor'
import { Header } from './components/header/header'
import { MessageItem } from './components/message-item/message-item'

interface ChatAreaProps {
	activeChannel: ChatChannel | null
	messages: ChatMessage[]
	teammates?: TeamMember[]
	tasks?: KanbanTask[]
	onSendMessage: (content: string, replyToMessageId?: string) => void
	onUpdateMessage: (id: string, content: string) => void
	onDeleteMessage: (id: string) => void
	onUpdateChannel: (id: string, name: string) => Promise<void>
	onDeleteChannel: (id: string) => Promise<void>
	currentUserId: string | undefined
	currentUserName?: string
	isLoading: boolean
	onToggleChatSidebar: () => void
}

export const ChatArea = ({
	activeChannel,
	messages,
	teammates = [],
	tasks = [],
	onSendMessage,
	onUpdateMessage,
	onDeleteMessage,
	onUpdateChannel,
	onDeleteChannel,
	currentUserId,
	currentUserName,
	isLoading,
	onToggleChatSidebar,
}: ChatAreaProps) => {
	const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const editorRef = useRef<EditorRef>(null)
	const hasScrolledRef = useRef<string | null>(null)
	const prevMessagesLengthRef = useRef<number>(messages.length)
	const mainRef = useRef<HTMLElement>(null)

	const scrollToBottom = (behavior: ScrollBehavior = 'instant') => {
		if (mainRef.current) {
			mainRef.current.scrollTo({
				top: mainRef.current.scrollHeight,
				behavior,
			})
		}
	}

	useEffect(() => {
		if (isLoading || !activeChannel?.$id) return

		const isNewChannel = hasScrolledRef.current !== activeChannel.$id
		const isNewMessage = messages.length > prevMessagesLengthRef.current

		if (isNewChannel && messages.length > 0) {
			scrollToBottom('instant')
			hasScrolledRef.current = activeChannel.$id
		} else if (isNewMessage) {
			scrollToBottom('smooth')
		}

		prevMessagesLengthRef.current = messages.length
	}, [messages, isLoading, activeChannel?.$id])

	const handleReply = (message: ChatMessage) => {
		setReplyingTo(message)
		setTimeout(() => {
			editorRef.current?.focus()
		}, 10)
	}

	const getDisplayName = () => {
		if (!activeChannel || activeChannel.type !== 'dm') return undefined

		const otherUserId = activeChannel.dmParticipants?.find(id => id !== currentUserId)
		const otherUser = teammates.find(m => m.userId === otherUserId)
		return otherUser?.userName ?? 'Direct Message'
	}

	return (
		<div className={classes.chatArea}>
			<Header
				activeChannel={activeChannel}
				onUpdateChannel={onUpdateChannel}
				onDeleteChannel={onDeleteChannel}
				currentUserId={currentUserId}
				onToggleChatSidebar={onToggleChatSidebar}
				displayName={getDisplayName()}
			/>
			<main className={classes.main} ref={mainRef}>
				{!activeChannel ? (
					<div className={classes.emptyState}>Select a channel to start a conversation, or create your first one</div>
				) : (
					<>
						<div className={classes.chatInfo}>
							<h5 className={classes.title}>{activeChannel.type === 'dm' ? getDisplayName() : activeChannel.name}</h5>
							<p className={classes.subtitle}>
								{activeChannel.type === 'dm'
									? `Direct message with ${getDisplayName()}`
									: activeChannel.description || `This is the start of the #${activeChannel.name} channel.`}
							</p>
						</div>
						<div className={classes.messages}>
							{isLoading ? (
								<div className={classes.loading}>Loading messages...</div>
							) : (
								<>
									{messages.map((message, index) => {
										const currentDate = new Date(message.$createdAt).toDateString()
										const prevDate = index > 0 ? new Date(messages[index - 1].$createdAt).toDateString() : null
										const isNewDay = currentDate !== prevDate
										const isContinuation =
											!isNewDay &&
											index > 0 &&
											messages[index - 1].senderId === message.senderId &&
											!message.replyToMessageId

										const repliedToMessage = message.replyToMessageId
											? messages.find(m => m.$id === message.replyToMessageId)
											: undefined

										return (
											<div key={message.$id}>
												{isNewDay && (
													<div className={classes.divider}>
														<hr />
														<span>{formatDividerDate(message.$createdAt)}</span>
													</div>
												)}

												<MessageItem
													isContinuation={isContinuation}
													message={message}
													teammates={teammates}
													tasks={tasks}
													currentUserId={currentUserId}
													currentUserName={currentUserName}
													onUpdate={onUpdateMessage}
													onDelete={onDeleteMessage}
													onReply={handleReply}
													repliedToMessage={repliedToMessage}
												/>
											</div>
										)
									})}
									<div ref={messagesEndRef} style={{ height: '1px' }} />
								</>
							)}
						</div>
					</>
				)}
			</main>
			{activeChannel && (
				<div className={classes.editorContainer}>
					{replyingTo && (
						<div className={classes.replyBanner}>
							<div className={classes.replyBannerContent}>
								<span className={classes.replyBannerName}>Replying to {replyingTo.senderName}</span>
								<span className={classes.replyBannerText}>{stripHtml(replyingTo.content)}</span>
							</div>
							<button onClick={() => setReplyingTo(null)} className={classes.replyBannerClose}>
								<CloseIcon />
							</button>
						</div>
					)}
					<Editor
						ref={editorRef}
						onSend={content => {
							onSendMessage(content, replyingTo?.$id)
							setReplyingTo(null)
						}}
						disabled={false}
						tasks={tasks}
					/>
				</div>
			)}
		</div>
	)
}
