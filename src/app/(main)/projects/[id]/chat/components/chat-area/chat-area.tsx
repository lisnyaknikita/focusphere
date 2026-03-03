import { ChatChannel, ChatMessage } from '@/shared/types/chat'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import classes from './chat-area.module.scss'
import { Editor } from './components/editor/editor'
import { Header } from './components/header/header'

interface ChatAreaProps {
	activeChannel: ChatChannel | null
	messages: ChatMessage[]
	onSendMessage: (content: string) => void
	isLoading: boolean
}

export const ChatArea = ({ activeChannel, messages, onSendMessage, isLoading }: ChatAreaProps) => {
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
									{messages.map(message => (
										<div className={classes.message} key={message.$id}>
											<div className={classes.authorAvatar}>
												<Image src={message.senderAvatar || '/avatar.jpg'} alt='avatar' width={46} height={46} />
											</div>
											<div className={classes.messageContent}>
												<div className={classes.messageHeader}>
													<div className={classes.name}>{message.senderName}</div>
													<time>
														{new Date(message.$createdAt).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</time>
												</div>
												<div className={classes.messageText} dangerouslySetInnerHTML={{ __html: message.content }} />
											</div>
										</div>
									))}
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
