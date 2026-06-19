import { Models } from 'appwrite'

export interface Project extends Models.Document {
	title: string
	description?: string
	type: 'solo' | 'team'
	ownerId: string
	teamId?: string
	color: string
	isFavorite?: boolean
	prefix: string
	taskCounter: number
	columns?: string[]
}

export interface CreateProjectPayload {
	title: string
	description?: string
	type: 'solo' | 'team'
	ownerId: string
	teamId?: string
	color?: string
	isFavorite?: boolean
	prefix: string
	taskCounter: number
	columns?: string[]
}

export type ProjectsView = 'solo' | 'team'
