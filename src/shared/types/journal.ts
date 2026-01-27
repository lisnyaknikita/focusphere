import { BaseNote } from './project-note'

export type TemplateKey =
	| 'emotional_checkin'
	| 'gratitude'
	| 'mind_dump'
	| 'anxiety_journal'
	| 'success_journal'
	| 'morning_planning'
	| 'evening_reflection'
	| 'empty'

export interface JournalEntry extends BaseNote {
	templateKey: TemplateKey
}

export interface CreateJournalEntryPayload {
	title: string
	content: string
	userId: string
	templateKey: TemplateKey
}

export type UpdateJournalEntryPayload = Partial<Omit<CreateJournalEntryPayload, 'userId' | 'templateKey'>>
