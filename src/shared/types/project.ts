import { Models } from 'appwrite'

export interface Project extends Models.Document {
	title: string
	description?: string
	type: 'solo' | 'team'
	ownerId: string
	teamId?: string
	logo?: string
	isFavorite?: boolean
}

export interface CreateProjectPayload {
	title: string
	description?: string
	type: 'solo' | 'team'
	ownerId: string
	teamId?: string
	logo?: string
	isFavorite?: boolean
}
