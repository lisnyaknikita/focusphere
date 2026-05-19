import { getTeamMembersWithNames } from '@/app/actions/get-team-members'
import { client } from '@/lib/appwrite'
import {
	createChannel,
	deleteChannel,
	deleteMessage,
	getChannels,
	getMessages,
	sendMessage,
	updateChannel,
	updateMessage,
} from '@/lib/projects/chat/chat'
import { ChatChannel, ChatMessage, CreateChannelPayload, TeamMember } from '@/shared/types/chat'
import { Project } from '@/shared/types/project'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useChat = (project: Project | null) => {
	const [teammates, setTeammates] = useState<TeamMember[]>([])
	const [channels, setChannels] = useState<ChatChannel[]>([])
	const [dmChannels, setDmChannels] = useState<ChatChannel[]>([])
	const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)

	const refreshTeammates = useCallback(async () => {
		if (!project?.teamId) return
		try {
			const members = await getTeamMembersWithNames(project.teamId)
			setTeammates(members)
		} catch (err) {
			console.error('Failed to fetch teammates:', err)
		}
	}, [project?.teamId])

	const refreshChannels = useCallback(async () => {
		if (!project?.$id) return

		try {
			const res = await getChannels(project.$id)
			const docs = res.rows as unknown as ChatChannel[]

			const publicChannels = docs.filter(ch => ch.type !== 'dm')
			const dms = docs.filter(ch => ch.type === 'dm')

			setChannels(publicChannels)
			setDmChannels(dms)

			if (publicChannels.length > 0 && !activeChannel) {
				setActiveChannel(publicChannels[0])
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

	const handleSendMessage = async (
		content: string,
		userId: string,
		userName: string,
		avatar?: string,
		replyToMessageId?: string
	) => {
		if (!activeChannel || !project) return

		const optimisticId = `temp-${Date.now()}`

		const optimisticMessage: ChatMessage = {
			$id: optimisticId,
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
			replyToMessageId,
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
					replyToMessageId,
				},
				project.teamId
			)
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

	const handleOpenDM = async (currentUserId: string, targetMember: TeamMember) => {
		if (!project) return

		const existingDM = dmChannels.find(
			ch =>
				ch.type === 'dm' &&
				ch.dmParticipants?.includes(currentUserId) &&
				ch.dmParticipants?.includes(targetMember.userId)
		)

		if (existingDM) {
			setActiveChannel(existingDM)
			return
		}

		const payload: CreateChannelPayload = {
			name: `dm-${currentUserId}-${targetMember.userId}`,
			projectId: project.$id,
			type: 'dm',
			ownerId: currentUserId,
			teamId: project.teamId,
			dmParticipants: [currentUserId, targetMember.userId],
		}

		try {
			const newChannel = (await createChannel(payload)) as unknown as ChatChannel
			setDmChannels(prev => [...prev, newChannel])
			setActiveChannel(newChannel)
		} catch (err) {
			console.error('Failed to open DM:', err)
			toast.error('Failed to open direct message')
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

		setMessages([])
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

						const tempMessageIndex = prev.findIndex(
							m => m.$id.startsWith('temp-') && m.senderId === payload.senderId && m.content === payload.content
						)

						if (tempMessageIndex !== -1) {
							const updatedMessages = [...prev]
							updatedMessages[tempMessageIndex] = payload
							return updatedMessages
						}

						return [...prev, payload]
					})
				}
			}
		)

		return () => unsubscribe()
	}, [activeChannel?.$id, project?.$id, refreshMessages])

	return {
		teammates,
		channels,
		dmChannels,
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
		openDM: handleOpenDM,
		refreshChannels,
		refreshTeammates,
	}
}
