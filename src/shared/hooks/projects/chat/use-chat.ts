'use client'

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
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export const useChat = (project: Project, currentUserId?: string) => {
	const queryClient = useQueryClient()
	const projectId = project?.$id

	const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)
	const [unreadChannelIds, setUnreadChannelIds] = useState<Set<string>>(new Set())
	const [isUnreadLoaded, setIsUnreadLoaded] = useState(false)

	useEffect(() => {
		if (!projectId || !currentUserId) return

		const key = `focusphere_unread_${currentUserId}_${projectId}`
		const stored = localStorage.getItem(key)
		if (stored) {
			try {
				const parsed = JSON.parse(stored)
				if (Array.isArray(parsed)) {
					setUnreadChannelIds(new Set(parsed))
				}
			} catch (err) {
				console.error('Failed to parse unread channels from localStorage:', err)
			}
		}
		setIsUnreadLoaded(true)
	}, [projectId, currentUserId])

	useEffect(() => {
		if (!projectId || !currentUserId || !isUnreadLoaded) return

		const key = `focusphere_unread_${currentUserId}_${projectId}`
		if (unreadChannelIds.size === 0) {
			localStorage.removeItem(key)
		} else {
			localStorage.setItem(key, JSON.stringify(Array.from(unreadChannelIds)))
		}
	}, [unreadChannelIds, projectId, currentUserId, isUnreadLoaded])

	const activeChannelRef = useRef<ChatChannel | null>(null)
	activeChannelRef.current = activeChannel

	const currentUserIdRef = useRef<string | undefined>(currentUserId)
	currentUserIdRef.current = currentUserId

	const handleSetActiveChannel = useCallback((channel: ChatChannel | null) => {
		setActiveChannel(channel)
		if (!channel) return
		setUnreadChannelIds(prev => {
			if (!prev.has(channel.$id)) return prev
			const next = new Set(prev)
			next.delete(channel.$id)
			return next
		})
	}, [])

	const { data: rawTeammates } = useQuery({
		queryKey: ['team-members', project?.teamId],
		queryFn: async () => {
			const res = await getTeamMembersWithNames(project.teamId!)

			if (res && typeof res === 'object' && !Array.isArray(res)) {
				throw new Error('Chat fallback: teammates fetch failed')
			}

			return Array.isArray(res) ? res : ([] as TeamMember[])
		},
		enabled: !!project?.teamId,
		staleTime: 1 * 60 * 1000,
	})
	const teammates = Array.isArray(rawTeammates) ? rawTeammates : []

	const { data: rawChannels } = useQuery({
		queryKey: ['chat-channels', projectId],
		queryFn: async () => {
			try {
				const res = await getChannels(projectId!)
				return res && Array.isArray(res.rows) ? (res.rows as unknown as ChatChannel[]) : []
			} catch (err) {
				console.error('Error in getChannels query:', err)
				return [] as ChatChannel[]
			}
		},
		enabled: !!projectId,
		staleTime: 1 * 60 * 1000,
	})
	const allChannels = Array.isArray(rawChannels) ? rawChannels : []

	const allChannelsRef = useRef<ChatChannel[]>([])
	allChannelsRef.current = allChannels

	const { data: rawTasks } = useQuery({
		queryKey: ['kanban-tasks', projectId],
		queryFn: async () => {
			try {
				const res = await getKanbanTasks(projectId!)
				return res && Array.isArray(res.rows) ? (res.rows as unknown as KanbanTask[]) : []
			} catch (err) {
				console.error('Error in getKanbanTasks query:', err)
				return [] as KanbanTask[]
			}
		},
		enabled: !!projectId,
		staleTime: 2 * 60 * 1000,
	})
	const tasks = Array.isArray(rawTasks) ? rawTasks : []

	const channels = allChannels.filter(ch => ch.type !== 'dm')
	const dmChannels = allChannels.filter(ch => ch.type === 'dm')

	useEffect(() => {
		if (channels.length > 0 && !activeChannel) {
			handleSetActiveChannel(channels[0])
		}
	}, [channels, activeChannel, handleSetActiveChannel])

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
			handleSetActiveChannel(newChannel)
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
				handleSetActiveChannel(channels.length > 0 ? channels[0] : null)
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
			handleSetActiveChannel(existingDM)
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
			handleSetActiveChannel(newChannel)
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
		if (!projectId) return

		const unsubscribe = client.subscribe(
			`databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.${process.env.NEXT_PUBLIC_TABLE_PROJECT_MESSAGES}.documents`,
			response => {
				const events = response.events
				const payload = response.payload as unknown as ChatMessage

				const isChannelInProject = allChannelsRef.current.some(ch => ch.$id === payload.channelId)
				if (!isChannelInProject) return

				if (payload.channelId === activeChannelRef.current?.$id) {
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
						setMessages(prev => prev.filter(m => m.$id !== payload.$id))
					}
					return
				}

				if (events.some(e => e.includes('.create')) && payload.senderId !== currentUserIdRef.current) {
					setUnreadChannelIds(prev => {
						if (prev.has(payload.channelId)) return prev
						const next = new Set(prev)
						next.add(payload.channelId)
						return next
					})
				}
			}
		)

		return () => unsubscribe()
	}, [projectId])

	useEffect(() => {
		if (!projectId) return

		const unsubscribe = client.subscribe(
			`databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.${process.env.NEXT_PUBLIC_TABLE_PROJECT_CHANNELS}.documents`,
			response => {
				const payload = response.payload as unknown as ChatChannel
				if (payload.projectId === projectId) {
					queryClient.invalidateQueries({ queryKey: ['chat-channels', projectId] })
				}
			}
		)

		return () => unsubscribe()
	}, [projectId, queryClient])

	return {
		teammates,
		channels,
		dmChannels,
		activeChannel,
		setActiveChannel: handleSetActiveChannel,
		messages,
		isLoadingMessages,
		unreadChannelIds,
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
