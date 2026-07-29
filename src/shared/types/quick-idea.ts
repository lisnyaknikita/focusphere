import { Models } from 'appwrite'

export interface QuickIdea extends Models.Document {
	text: string
	userId: string
}

export type CreateQuickIdeaPayload = Omit<QuickIdea, keyof Models.Document>
