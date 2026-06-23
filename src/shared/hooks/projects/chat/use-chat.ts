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
import { getKanbanTasks } from '@/lib/projects/kanban-board-tasks/tasks'
import { ChatChannel, ChatMessage, CreateChannelPayload, TeamMember } from '@/shared/types/chat'
import { KanbanTask } from '@/shared/types/kanban-task'
import { Project } from '@/shared/types/project'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useChat = (project: Project) => {
	const queryClient = useQueryClient()
	const projectId = project?.$id

	const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)

	const { data: teammates = [] } = useQuery({
		queryKey: ['team-members', project?.teamId],
		queryFn: () => getTeamMembersWithNames(project.teamId!),
		enabled: !!project?.teamId,
		staleTime: 5 * 60 * 1000,
	})

	const { data: allChannels = [] } = useQuery({
		queryKey: ['chat-channels', projectId],
		queryFn: async () => {
			const res = await getChannels(projectId!)
			return res.rows as unknown as ChatChannel[]
		},
		enabled: !!projectId,
		staleTime: 1 * 60 * 1000,
	})

	const { data: tasks = [] } = useQuery({
		queryKey: ['kanban-tasks', projectId],
		queryFn: async () => {
			const res = await getKanbanTasks(projectId!)
			return res.rows as unknown as KanbanTask[]
		},
		enabled: !!projectId,
		staleTime: 2 * 60 * 1000,
	})

	const channels = allChannels.filter(ch => ch.type !== 'dm')
	const dmChannels = allChannels.filter(ch => ch.type === 'dm')

	useEffect(() => {
		if (channels.length > 0 && !activeChannel) {
			setActiveChannel(channels[0])
		}
	}, [channels, activeChannel])

	useEffect(() => {
		if (!activeChannel?.$id) return

		const fetchMessages = async () => {
			setIsLoadingMessages(true)
			try {
				const res = await getMessages(activeChannel.$id)
				const docs = res.rows as unknown as ChatMessage[]
				setMessages(Array.isArray(docs) ? docs : [])
			} catch (err: unknown) {
				console.error('Failed to fetch messages:', err)
			} finally {
				setIsLoadingMessages(false)
			}
		}

		setMessages([])
		fetchMessages()
	}, [activeChannel?.$id])

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
			await queryClient.invalidateQueries({ queryKey: ['chat-channels', projectId] })
			setActiveChannel(newChannel)
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to create channel')
		}
	}

	const handleUpdateChannel = async (id: string, name: string) => {
		try {
			await updateChannel(id, name)
			await queryClient.invalidateQueries({ queryKey: ['chat-channels', projectId] })
			if (activeChannel?.$id === id) {
				setActiveChannel(prev => (prev ? { ...prev, name } : null))
			}
		} catch (err: unknown) {
			console.error(err)
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
			await queryClient.invalidateQueries({ queryKey: ['chat-channels', projectId] })
			if (activeChannel?.$id === id) {
				setActiveChannel(channels.length > 0 ? channels[0] : null)
			}
		} catch (err: unknown) {
			console.error(err)
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
			await queryClient.invalidateQueries({ queryKey: ['chat-channels', projectId] })
			setActiveChannel(newChannel)
		} catch (err: unknown) {
			console.error(err)
			toast.error('Failed to open direct message')
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
		} catch (err: unknown) {
			setMessages(prev => prev.filter(m => m.$id !== optimisticMessage.$id))
			console.error(err)
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
		} catch (err: unknown) {
			setMessages(oldMessages)
			console.error(err)
			toast.error('Failed to edit message')
		}
	}

	const handleDeleteMessage = async (messageId: string) => {
		const oldMessages = [...messages]
		setMessages(prev => prev.filter(m => m.$id !== messageId))
		try {
			await deleteMessage(messageId)
		} catch (err: unknown) {
			setMessages(oldMessages)
			console.error(err)
			toast.error('Failed to delete message')
		}
	}

	useEffect(() => {
		if (!activeChannel?.$id || !projectId) return

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
							const updated = [...prev]
							updated[tempMessageIndex] = payload
							return updated
						}

						return [...prev, payload]
					})
				}

				if (events.some(e => e.includes('.update'))) {
					setMessages(prev => prev.map(m => (m.$id === payload.$id ? payload : m)))
				}

				if (events.some(e => e.includes('.delete'))) {
					setMessages(prev => prev.filter(m => (m.$id === payload.$id ? false : true)))
				}
			}
		)

		return () => unsubscribe()
	}, [activeChannel?.$id, projectId])

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
		tasks,
	}
}
