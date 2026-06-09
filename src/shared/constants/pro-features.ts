export interface ProFeature {
	id: string
	title: string
	description: string
	icon: string
}

export const PRO_FEATURES: Record<string, ProFeature> = {
	projects_unlimited: {
		id: 'projects_unlimited',
		title: 'Unlimited Projects',
		description: 'Remove the 2-project limit and create as many workspaces as you need.',
		icon: '📂',
	},
	projects_team: {
		id: 'projects_team',
		title: 'Team Collaboration',
		description: 'Unlock team mode. Invite members to your projects and collaborate seamlessly.',
		icon: '👥',
	},

	planner_blocks_unlimited: {
		id: 'planner_blocks_unlimited',
		title: 'Unlimited Time Blocks',
		description: 'Plan without boundaries. Go beyond the 50 time blocks per month restriction.',
		icon: '♾️',
	},
	planner_recurrence: {
		id: 'planner_recurrence',
		title: 'Recurring Time Blocks',
		description: 'Automate your schedule by repeating time blocks across multiple days in a single click.',
		icon: '🔁',
	},
	planner_copying: {
		id: 'planner_copying',
		title: 'Time Blocks Copying',
		description: 'Save valuable planning time by instantly copying and pasting your existing time blocks.',
		icon: '📋',
	},

	kanban_customization: {
		id: 'kanban_customization',
		title: 'Custom Kanban Columns',
		description: 'Go beyond the standard workflow. Fully customize your board with your own tailored columns.',
		icon: '⚙️',
	},

	notes_unlimited: {
		id: 'notes_unlimited',
		title: 'Unlimited Active Notes',
		description: 'Bypass the 6 active notes restriction. Capture every single thought and idea without caps.',
		icon: '📝',
	},

	journal_unlimited: {
		id: 'journal_unlimited',
		title: 'Unlimited Journal Entries',
		description: 'Reflect without limits. Write as many journal entries as you want without the 6-entry cap.',
		icon: '📓',
	},
	journal_templates: {
		id: 'journal_templates',
		title: 'Premium & Custom Templates',
		description: 'Unlock all system journal templates and build your own custom structures for reflection.',
		icon: '✨',
	},
}
