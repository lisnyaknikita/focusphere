import { Models } from 'appwrite'

export interface ChatChannel extends Models.Document {
	name: string
	projectId: string
	description?: string
	type: 'private' | 'public'
	ownerId: string
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
	isEdited?: boolean
}

export interface CreateMessagePayload {
	content: string
	channelId: string
	senderId: string
	senderName: string
	senderAvatar?: string
	isEdited?: boolean
}
