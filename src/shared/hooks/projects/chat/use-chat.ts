import { createChannel, getChannels, getMessages, sendMessage } from '@/lib/projects/chat/chat'
import { ChatChannel, ChatMessage, CreateChannelPayload } from '@/shared/types/chat'
import { Project } from '@/shared/types/project'
import { useCallback, useEffect, useState } from 'react'

export const useChat = (project: Project | null) => {
	const [channels, setChannels] = useState<ChatChannel[]>([])
	const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)

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
		await createChannel(payload)
		await refreshChannels()
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
		}
	}

	useEffect(() => {
		if (project?.$id) {
			refreshChannels()
		}
	}, [project?.$id, refreshChannels])

	useEffect(() => {
		if (!activeChannel || !project?.$id) return

		refreshMessages(activeChannel.$id)

		const interval = setInterval(() => {
			refreshMessages(activeChannel.$id, true)
		}, 2000)

		return () => clearInterval(interval)
	}, [activeChannel?.$id, project?.$id])

	return {
		channels,
		activeChannel,
		setActiveChannel,
		messages,
		isLoadingMessages,
		createChannel: handleCreateChannel,
		sendMessage: handleSendMessage,
		refreshChannels,
	}
}
