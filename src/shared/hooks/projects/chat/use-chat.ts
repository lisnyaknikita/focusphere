import { client } from '@/lib/appwrite'
import {
	createChannel,
	deleteChannel,
	deleteMessage,
	getChannels,
	getMessages,
	getTeamMembers,
	sendMessage,
	updateChannel,
	updateMessage,
} from '@/lib/projects/chat/chat'
import { ChatChannel, ChatMessage, CreateChannelPayload } from '@/shared/types/chat'
import { Project } from '@/shared/types/project'
import { Models } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useChat = (project: Project | null) => {
	const [teammates, setTeammates] = useState<Models.Membership[]>([])
	const [channels, setChannels] = useState<ChatChannel[]>([])
	const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)

	const refreshTeammates = useCallback(async () => {
		if (!project?.teamId) return

		try {
			const res = await getTeamMembers(project.teamId)
			console.log('Teammates loaded:', res.memberships)
			setTeammates(res.memberships)
		} catch (err) {
			console.error('Failed to fetch teammates:', err)
		}
	}, [project?.teamId])

	const refreshChannels = useCallback(async () => {
		if (!project?.$id) return

		try {
			const res = await getChannels(project.$id)
			const docs = res.rows as unknown as ChatChannel[]
			setChannels(docs)

			if (docs.length > 0 && !activeChannel) {
				setActiveChannel(docs[0])
			}
		} catch (err) {
			console.error('Failed to fetch channels:', err)
		}
	}, [project?.$id, activeChannel])

	const refreshMessages = useCallback(async (channelId: string, silent = false) => {
		if (!silent) setIsLoadingMessages(true)

		try {
			const res = await getMessages(channelId)
			const docs = res.rows as unknown as ChatMessage[]
			setMessages(Array.isArray(docs) ? docs : [])
		} catch (err) {
			console.error('Failed to fetch messages:', err)
		} finally {
			if (!silent) setIsLoadingMessages(false)
		}
	}, [])

	const handleCreateChannel = async (name: string, ownerId: string) => {
		if (!project) return

		const payload: CreateChannelPayload = {
			name,
			projectId: project.$id,
			type: 'public',
			ownerId,
			teamId: project.teamId,
		}

		try {
			const newChannel = (await createChannel(payload)) as unknown as ChatChannel

			await refreshChannels()

			setActiveChannel(newChannel)

			console.log('New channel created and set as active:', newChannel.name)
		} catch (err) {
			console.error('Failed to create channel:', err)
			toast.error('Failed to create channel')
		}
	}

	const handleSendMessage = async (content: string, userId: string, userName: string, avatar?: string) => {
		if (!activeChannel || !project) return

		const optimisticMessage: ChatMessage = {
			$id: `temp-${Date.now()}`,
			$createdAt: new Date().toISOString(),
			$updatedAt: new Date().toISOString(),
			$permissions: [],
			$collectionId: '',
			$databaseId: '',
			$sequence: 0,
			content,
			channelId: activeChannel.$id,
			senderId: userId,
			senderName: userName,
			senderAvatar: avatar,
		}

		setMessages(prev => [...prev, optimisticMessage])

		try {
			await sendMessage(
				{
					content,
					channelId: activeChannel.$id,
					senderId: userId,
					senderName: userName,
					senderAvatar: avatar,
				},
				project.teamId
			)
			await refreshMessages(activeChannel.$id, true)
		} catch (err) {
			setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id))
			console.error('Failed to send message:', err)
			toast.error('Failed to send message')
		}
	}

	const handleUpdateMessage = async (messageId: string, newContent: string) => {
		const oldMessages = [...messages]
		setMessages(prev =>
			prev.map(m => (m.$id === messageId ? { ...m, content: newContent, $updatedAt: new Date().toISOString() } : m))
		)

		try {
			await updateMessage(messageId, newContent)
		} catch (err) {
			setMessages(oldMessages)
			console.error('Failed to update message:', err)
			toast.error('Failed to edit message')
		}
	}

	const handleDeleteMessage = async (messageId: string) => {
		const oldMessages = [...messages]
		setMessages(prev => prev.filter(m => m.$id !== messageId))

		try {
			await deleteMessage(messageId)
		} catch (err) {
			setMessages(oldMessages)
			console.error('Failed to delete message:', err)
			toast.error('Failed to delete message')
		}
	}

	const handleUpdateChannel = async (id: string, name: string) => {
		try {
			await updateChannel(id, name)
			setChannels(prev => prev.map(ch => (ch.$id === id ? { ...ch, name } : ch)))
			if (activeChannel?.$id === id) {
				setActiveChannel(prev => (prev ? { ...prev, name } : null))
			}
		} catch (err) {
			console.error('Failed to update channel:', err)
			toast.error('Failed to rename channel')
		}
	}

	const handleDeleteChannel = async (id: string) => {
		const deletePromise = deleteChannel(id)

		toast.promise(deletePromise, {
			loading: 'Deleting channel...',
			success: 'Channel deleted successfully',
			error: 'Failed to delete channel',
		})

		try {
			await deletePromise
			const updatedChannels = channels.filter(ch => ch.$id !== id)
			setChannels(updatedChannels)

			if (activeChannel?.$id === id) {
				setActiveChannel(updatedChannels.length > 0 ? updatedChannels[0] : null)
			}
		} catch (err) {
			console.error('Failed to delete channel:', err)
		}
	}

	useEffect(() => {
		if (project?.$id) {
			refreshChannels()
		}
		if (project?.teamId) {
			refreshTeammates()
		}
	}, [project?.$id, project?.teamId, refreshChannels, refreshTeammates])

	useEffect(() => {
		if (!activeChannel || !project?.$id) return

		refreshMessages(activeChannel.$id)

		const unsubscribe = client.subscribe(
			`databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.${process.env.NEXT_PUBLIC_TABLE_PROJECT_MESSAGES}.documents`,
			response => {
				const events = response.events
				const payload = response.payload as unknown as ChatMessage

				if (payload.channelId !== activeChannel.$id) return

				if (events.some(e => e.includes('.create'))) {
					setMessages(prev => {
						if (prev.some(m => m.$id === payload.$id)) return prev
						return [...prev, payload]
					})
				} else if (events.some(e => e.includes('.update'))) {
					setMessages(prev => prev.map(m => (m.$id === payload.$id ? payload : m)))
				} else if (events.some(e => e.includes('.delete'))) {
					setMessages(prev => prev.filter(m => m.$id !== payload.$id))
				}
			}
		)

		return () => unsubscribe()
	}, [activeChannel?.$id, project?.$id, refreshMessages])

	return {
		teammates,
		channels,
		activeChannel,
		setActiveChannel,
		messages,
		isLoadingMessages,
		createChannel: handleCreateChannel,
		sendMessage: handleSendMessage,
		updateMessage: handleUpdateMessage,
		deleteMessage: handleDeleteMessage,
		updateChannel: handleUpdateChannel,
		deleteChannel: handleDeleteChannel,
		refreshChannels,
		refreshTeammates,
	}
}
