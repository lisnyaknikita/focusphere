import dynamic from 'next/dynamic'
import Image from 'next/image'
import classes from './chat-area.module.scss'
import { Header } from './components/header/header'

const Editor = dynamic(() => import('./components/editor/editor'))

export const ChatArea = () => {
	return (
		<div className={classes.chatArea}>
			<Header />
			<div style={{ flex: 1 }}></div>
			<main className={classes.main}>
				<div className={classes.chatInfo}>
					<h5 className={classes.title}>#general</h5>
					<p className={classes.subtitle}>
						This channel was created on July 29th, 2025. This is the very beginning of the <b>general</b> channel.
					</p>
				</div>
				<div className={classes.divider}>
					<hr />
					<span>Tuesday, July 29</span>
				</div>
				<div className={classes.messages}>
					<div className={classes.message}>
						<div className={classes.authorAvatar}>
							<Image src={'/avatar.png'} alt='avatar' width={46} height={46} />
						</div>
						<div className={classes.messageContent}>
							<div className={classes.messageHeader}>
								<div className={classes.name}>nlisnyak</div>
								<time>1:45 PM</time>
							</div>
							<p className={classes.messageText}>Some message in this chat lorem ipsum</p>
						</div>
					</div>
					<div className={classes.message}>
						<div className={classes.authorAvatar}>
							<Image src={'/avatar.png'} alt='avatar' width={46} height={46} />
						</div>
						<div className={classes.messageContent}>
							<div className={classes.messageHeader}>
								<div className={classes.name}>nlisnyak</div>
								<time>1:45 PM</time>
							</div>
							<p className={classes.messageText}>Some message in this chat lorem ipsum</p>
						</div>
					</div>
				</div>
			</main>
			<Editor />
		</div>
	)
}
