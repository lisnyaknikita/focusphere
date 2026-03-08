import { ChatChannel, ChatMessage } from '@/shared/types/chat'
import { useEffect, useRef } from 'react'
import classes from './chat-area.module.scss'
import { Editor } from './components/editor/editor'
import { Header } from './components/header/header'
import { MessageItem } from './components/message-item/message-item'

interface ChatAreaProps {
	activeChannel: ChatChannel | null
	messages: ChatMessage[]
	onSendMessage: (content: string) => void
	onUpdateMessage: (id: string, content: string) => void
	onDeleteMessage: (id: string) => void
	currentUserId: string | undefined
	isLoading: boolean
}

export const ChatArea = ({
	activeChannel,
	messages,
	onSendMessage,
	onUpdateMessage,
	onDeleteMessage,
	currentUserId,
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
			<Header activeChannel={activeChannel} />
			<main className={classes.main} style={{ flex: 1 }}>
				{!activeChannel ? (
					<div className={classes.emptyState}>Select a channel to start chatting</div>
				) : (
					<>
						<div className={classes.chatInfo}>
							<h5 className={classes.title}>{activeChannel?.name}</h5>
							<p className={classes.subtitle}>
								{activeChannel.description || `This is the start of the #${activeChannel.name} channel.`}
							</p>
						</div>
						<div className={classes.divider}>
							<hr />
							<span>Tuesday, July 29</span>
						</div>
						<div className={classes.messages}>
							{isLoading ? (
								<div className={classes.loading}>Loading messages...</div>
							) : (
								<>
									{messages.map((message, index) => {
										const isContinuation = index > 0 && messages[index - 1].senderId === message.senderId
										return (
											<MessageItem
												key={message.$id}
												isContinuation={isContinuation}
												message={message}
												currentUserId={currentUserId}
												onUpdate={onUpdateMessage}
												onDelete={onDeleteMessage}
											/>
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
