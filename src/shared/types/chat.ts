import { Models } from 'appwrite'

export interface ChatChannel extends Models.Document {
	name: string
	projectId: string
	description?: string
	type: 'private' | 'public' | 'dm'
	ownerId: string
	dmParticipants?: string[]
}

export interface CreateChannelPayload {
	name: string
	projectId: string
	description?: string
	type: 'private' | 'public' | 'dm'
	ownerId: string
	teamId?: string
	dmParticipants?: string[]
}

export interface ChatMessage extends Models.Document {
	content: string
	channelId: string
	senderId: string
	senderName: string
	senderAvatar?: string
	isEdited?: boolean
	replyToMessageId?: string
}

export interface CreateMessagePayload {
	content: string
	channelId: string
	senderId: string
	senderName: string
	senderAvatar?: string
	isEdited?: boolean
	replyToMessageId?: string
}

export interface TeamMember {
	$id: string
	userId: string
	userName: string
	userEmail: string
	roles: string[]
}
