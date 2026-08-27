import { PartialBlock } from '@blocknote/core'

export const JOURNAL_TEMPLATES = {
	emotional_checkin: {
		key: 'emotional_checkin',
		title: 'Emotional Check-In',
		icon: '🫀',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'How am I feeling right now?',
			},
			{ type: 'bulletListItem', content: 'Main emotion: ' },
			{ type: 'bulletListItem', content: 'Intensity (1–10): ' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What happened or what was I thinking about?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What is this feeling trying to tell me?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What do I need right now?',
			},
			{ type: 'bulletListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What would help me feel 1 point better?',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	gratitude: {
		key: 'gratitude',
		title: 'Gratitude Journal',
		icon: '🙏',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'What made today a little better?',
			},
			{ type: 'numberedListItem', content: 'Something I’m grateful for: ' },
			{ type: 'numberedListItem', content: 'A small moment I enjoyed: ' },
			{ type: 'numberedListItem', content: 'Someone or something I appreciate: ' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'Why did these moments matter to me?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What do I want to remember about today?',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	anxiety_journal: {
		key: 'anxiety_journal',
		title: 'Anxiety Journal',
		icon: '😰',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'What am I worried about?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What happened that triggered this worry?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What am I telling myself about it?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What evidence supports this thought?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What evidence might suggest another possibility?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What is actually in my control?',
			},
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What is outside my control?',
			},
			{ type: 'bulletListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What is one small action I can take now?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'How do I feel about it now? (1–10)',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	mind_dump: {
		key: 'mind_dump',
		title: 'Mind Dump',
		icon: '🧠',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'Everything on my mind right now',
			},
			{
				type: 'paragraph',
				content: 'Write freely. Don’t organize or edit your thoughts.',
			},
			{ type: 'paragraph', content: '' },
			{ type: 'paragraph', content: '' },
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'After getting it out of my head...',
			},
			{
				type: 'paragraph',
				content: 'What feels most important right now?',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	success_journal: {
		key: 'success_journal',
		title: 'Success Journal',
		icon: '🏆',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'What went well today?',
			},
			{ type: 'bulletListItem', content: 'Something I accomplished: ' },
			{ type: 'bulletListItem', content: 'Something I handled well: ' },
			{ type: 'bulletListItem', content: 'Something I’m proud of: ' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What was difficult, and how did I handle it?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What did today prove I’m capable of?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What do I want to carry into tomorrow?',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	morning_planning: {
		key: 'morning_planning',
		title: 'Morning Planning',
		icon: '🌅',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'How do I want to feel at the end of today?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'My 3 priorities',
			},
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },
			{ type: 'numberedListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What would make today feel successful?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What might get in my way?',
			},
			{ type: 'bulletListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What can I do now to make that easier?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'One thing I want to make time for today',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},

	evening_reflection: {
		key: 'evening_reflection',
		title: 'Evening Reflection',
		icon: '🌙',
		content: [
			{
				type: 'heading',
				props: { level: 3 },
				content: 'What happened today that is worth remembering?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What went well?',
			},
			{ type: 'bulletListItem', content: '' },
			{ type: 'bulletListItem', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What felt difficult or draining?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What did I learn about myself?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'Was there a moment when I acted differently than I usually would?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What would I like to do differently next time?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What is one thing I can leave behind tonight?',
			},
			{ type: 'paragraph', content: '' },

			{
				type: 'heading',
				props: { level: 3 },
				content: 'What am I taking with me into tomorrow?',
			},
			{ type: 'paragraph', content: '' },
		] as PartialBlock[],
	},
} as const

export type TemplateKey = keyof typeof JOURNAL_TEMPLATES | 'empty'
