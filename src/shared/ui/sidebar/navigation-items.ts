import { NavigationItem } from '@/shared/types/navigation'

export const navItems: NavigationItem[] = [
	{
		label: 'Hide',
		iconSrc: './hide.svg',
		iconAlt: 'hide',
		isButton: true,
	},
	{
		label: 'Dashboard',
		href: '/',
		iconSrc: './dashboard.svg',
		iconAlt: 'dashboard',
	},
	{
		label: 'Calendar',
		href: '/calendar',
		iconSrc: './calendar.svg',
		iconAlt: 'calendar',
	},
	{
		label: 'Planner',
		href: '/planner',
		iconSrc: './planner.svg',
		iconAlt: 'planner',
	},
	{
		label: 'Projects',
		href: '/projects',
		iconSrc: './projects.svg',
		iconAlt: 'projects',
	},
	{
		label: 'Focus and timer',
		href: '/timer',
		iconSrc: './timer.svg',
		iconAlt: 'timer',
	},
	{
		label: 'Journal',
		href: '/journal',
		iconSrc: './journal.svg',
		iconAlt: 'journal',
	},
	{
		label: 'Notes',
		href: '/notes',
		iconSrc: './notes.svg',
		iconAlt: 'notes',
	},
]
