import { ChatArea } from './components/chat-area/chat-area'
import { ChatSidebar } from './components/chat-sidebar/chat-sidebar'
import classes from './page.module.scss'

export default function ChatPage() {
	return (
		<div className={classes.chatPage}>
			<div className={classes.inner}>
				<ChatSidebar />
				<ChatArea />
			</div>
		</div>
	)
}
