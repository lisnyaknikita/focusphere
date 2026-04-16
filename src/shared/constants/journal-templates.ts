import { PartialBlock } from '@blocknote/core'

export const JOURNAL_TEMPLATES = {
	emotional_checkin: {
		key: 'emotional_checkin',
		title: 'Emotional Check-In',
		icon: '🫀',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'How am I feeling right now?' },
			{ type: 'bulletListItem', content: 'Main emotion: ' },
			{ type: 'bulletListItem', content: 'Intensity (1–10): ' },
			{ type: 'heading', props: { level: 3 }, content: 'What caused this feeling?' },
			{ type: 'paragraph', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'Where do I feel it in my body?' },
			{ type: 'paragraph', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'What do I need right now?' },
			{ type: 'bulletListItem', content: '' },
		] as PartialBlock[],
	},

	gratitude: {
		key: 'gratitude',
		title: 'Gratitude Journal',
		icon: '🙏',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'What am I grateful for today?' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'Why does this matter to me?' },
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	mind_dump: {
		key: 'mind_dump',
		title: 'Mind Dump',
		icon: '🧠',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'Everything on my mind right now' },
			{ type: 'paragraph', content: 'Write freely. No structure, no filtering.' },
			{ type: 'paragraph' },
			{ type: 'paragraph' },
			{ type: 'paragraph' },
		] as PartialBlock[],
	},

	anxiety_journal: {
		key: 'anxiety_journal',
		title: 'Anxiety Journal',
		icon: '😰',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'What am I anxious about?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'What is the worst-case scenario?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'How likely is this actually?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'What is in my control?' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'One small step I can take' },
			{ type: 'paragraph' },
		] as PartialBlock[],
	},

	success_journal: {
		key: 'success_journal',
		title: 'Success Journal',
		icon: '🏆',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'What did I do well today?' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'What challenge did I overcome?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'What does this say about me?' },
			{ type: 'paragraph' },
		] as PartialBlock[],
	},

	morning_planning: {
		key: 'morning_planning',
		title: 'Morning Planning',
		icon: '🌅',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'Top 3 priorities for today' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'One thing that will make today successful' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'Potential obstacles' },
			{ type: 'bulletListItem', content: '' },
		] as PartialBlock[],
	},

	evening_reflection: {
		key: 'evening_reflection',
		title: 'Evening Reflection',
		icon: '🌙',
		content: [
			{ type: 'heading', props: { level: 3 }, content: 'What went well today?' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },
			{ type: 'heading', props: { level: 3 }, content: 'What didn’t go as planned?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'What did I learn?' },
			{ type: 'paragraph' },
			{ type: 'heading', props: { level: 3 }, content: 'One thing I’ll improve tomorrow' },
			{ type: 'paragraph' },
		] as PartialBlock[],
	},
} as const

export type TemplateKey = keyof typeof JOURNAL_TEMPLATES | 'empty'
