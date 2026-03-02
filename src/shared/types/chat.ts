import { Models } from 'appwrite'

export interface ChatChannel extends Models.Document {
	name: string
	projectId: string
	description?: string
	type: 'private' | 'public'
}

export interface CreateChannelPayload {
	name: string
	projectId: string
	description?: string
	type: 'private' | 'public'
	ownerId: string
	teamId?: string
}

export interface ChatMessage extends Models.Document {
	content: string
	channelId: string
	senderId: string
	senderName: string
	senderAvatar?: string
}

export interface CreateMessagePayload {
	content: string
	channelId: string
	senderId: string
	senderName: string
	senderAvatar?: string
}
