import { ChatChannel, ChatMessage } from '@/shared/types/chat'
import { formatDividerDate } from '@/shared/utils/format-divider-date/format-divider-date'
import { Models } from 'appwrite'
import { useEffect, useRef } from 'react'
import classes from './chat-area.module.scss'
import { Editor } from './components/editor/editor'
import { Header } from './components/header/header'
import { MessageItem } from './components/message-item/message-item'

interface ChatAreaProps {
	activeChannel: ChatChannel | null
	messages: ChatMessage[]
	teammates?: Models.Membership[]
	onSendMessage: (content: string) => void
	onUpdateMessage: (id: string, content: string) => void
	onDeleteMessage: (id: string) => void
	onUpdateChannel: (id: string, name: string) => Promise<void>
	onDeleteChannel: (id: string) => Promise<void>
	currentUserId: string | undefined
	currentUserName?: string
	isLoading: boolean
}

export const ChatArea = ({
	activeChannel,
	messages,
	teammates = [],
	onSendMessage,
	onUpdateMessage,
	onDeleteMessage,
	onUpdateChannel,
	onDeleteChannel,
	currentUserId,
	currentUserName,
	isLoading,
}: ChatAreaProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const hasScrolledRef = useRef<string | null>(null)
	const prevMessagesLengthRef = useRef<number>(messages.length)

	const scrollToBottom = (behavior: ScrollBehavior = 'instant') => {
		messagesEndRef.current?.scrollIntoView({ behavior })
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

	return (
		<div className={classes.chatArea}>
			<Header
				activeChannel={activeChannel}
				onUpdateChannel={onUpdateChannel}
				onDeleteChannel={onDeleteChannel}
				currentUserId={currentUserId}
			/>
			<main className={classes.main}>
				{!activeChannel ? (
					<div className={classes.emptyState}>Select a channel to start a conversation, or create your first one</div>
				) : (
					<>
						<div className={classes.chatInfo}>
							<h5 className={classes.title}>{activeChannel?.name}</h5>
							<p className={classes.subtitle}>
								{activeChannel.description || `This is the start of the #${activeChannel.name} channel.`}
							</p>
						</div>
						{/* <div className={classes.divider}>
							<hr />
							<span>Tuesday, July 29</span>
						</div> */}
						<div className={classes.messages}>
							{isLoading ? (
								<div className={classes.loading}>Loading messages...</div>
							) : (
								<>
									{messages.map((message, index) => {
										const currentDate = new Date(message.$createdAt).toDateString()
										const prevDate = index > 0 ? new Date(messages[index - 1].$createdAt).toDateString() : null
										const isNewDay = currentDate !== prevDate
										const isContinuation = !isNewDay && index > 0 && messages[index - 1].senderId === message.senderId

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
													currentUserId={currentUserId}
													currentUserName={currentUserName}
													onUpdate={onUpdateMessage}
													onDelete={onDeleteMessage}
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
			{activeChannel && <Editor onSend={onSendMessage} disabled={false} />}
		</div>
	)
}
