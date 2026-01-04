export const CALENDAR_COLORS = {
	GOLD: '#D79716',
	RED: '#D71616',
	GREEN: '#17720F',
	BLUE: '#1351AE',
	PURPLE: '#97107A',
	CYAN: '#16ADD7',
} as const

export const COLOR_TO_CALENDAR_MAP: Record<string, string> = {
	[CALENDAR_COLORS.GOLD]: 'gold',
	[CALENDAR_COLORS.RED]: 'red',
	[CALENDAR_COLORS.GREEN]: 'green',
	[CALENDAR_COLORS.BLUE]: 'blue',
	[CALENDAR_COLORS.PURPLE]: 'purple',
	[CALENDAR_COLORS.CYAN]: 'cyan',
}

export const CALENDARS_CONFIG = {
	gold: {
		colorName: 'gold',
		lightColors: {
			main: CALENDAR_COLORS.GOLD,
			container: '#FFF4DC',
			onContainer: '#4A3300',
		},
	},
	red: {
		colorName: 'red',
		lightColors: {
			main: CALENDAR_COLORS.RED,
			container: '#FFE0E0',
			onContainer: '#4A0000',
		},
	},
	green: {
		colorName: 'green',
		lightColors: {
			main: CALENDAR_COLORS.GREEN,
			container: '#E0F5DE',
			onContainer: '#0A3006',
		},
	},
	blue: {
		colorName: 'blue',
		lightColors: {
			main: CALENDAR_COLORS.BLUE,
			container: '#DCE9FF',
			onContainer: '#001D4A',
		},
	},
	purple: {
		colorName: 'purple',
		lightColors: {
			main: CALENDAR_COLORS.PURPLE,
			container: '#FFE0F5',
			onContainer: '#3D0030',
		},
	},
	cyan: {
		colorName: 'cyan',
		lightColors: {
			main: CALENDAR_COLORS.CYAN,
			container: '#DCF4FF',
			onContainer: '#003D4A',
		},
	},
}

export const getCalendarIdByColor = (color: string): string => {
	return COLOR_TO_CALENDAR_MAP[color] || 'blue'
}
