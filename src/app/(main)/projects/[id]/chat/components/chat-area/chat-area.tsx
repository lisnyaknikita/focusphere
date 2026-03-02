import { ChatChannel, ChatMessage } from '@/shared/types/chat'
import Image from 'next/image'
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
	return (
		<div className={classes.chatArea}>
			<Header activeChannel={activeChannel} />
			<div style={{ flex: 1 }}></div>
			<main className={classes.main}>
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
								messages.map(message => (
									<div className={classes.message} key={message.$id}>
										<div className={classes.authorAvatar}>
											<Image src={message.senderAvatar || '/avatar.jpg'} alt='avatar' width={46} height={46} />
										</div>
										<div className={classes.messageContent}>
											<div className={classes.messageHeader}>
												<div className={classes.name}>{message.senderName}</div>
												<time>
													{new Date(message.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</time>
											</div>
											<div className={classes.messageText} dangerouslySetInnerHTML={{ __html: message.content }} />
										</div>
									</div>
								))
							)}
						</div>
					</>
				)}
			</main>
			{activeChannel && <Editor onSend={onSendMessage} disabled={false} />}
		</div>
	)
}
