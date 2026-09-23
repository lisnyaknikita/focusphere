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
			main: '#C87F20',
			container: '#eba446',
			onContainer: '#000',
		},
		darkColors: {
			main: '#C87F20',
			container: '#E0993B',
			onContainer: '#000',
		},
	},
	red: {
		colorName: 'red',
		lightColors: {
			main: '#B73F22',
			container: '#f5532a',
			onContainer: '#000',
		},
		darkColors: {
			main: '#B73F22',
			container: '#D85838',
			onContainer: '#000',
		},
	},
	green: {
		colorName: 'green',
		lightColors: {
			main: '#2F7A4B',
			container: '#4B9B69',
			onContainer: '#000',
		},
		darkColors: {
			main: '#2F7A4B',
			container: '#4B9B69',
			onContainer: '#000',
		},
	},
	blue: {
		colorName: 'blue',
		lightColors: {
			main: '#2B78B3',
			container: '#4A9CD6',
			onContainer: '#000',
		},
		darkColors: {
			main: '#2B78B3',
			container: '#4A9CD6',
			onContainer: '#000',
		},
	},
	purple: {
		colorName: 'purple',
		lightColors: {
			main: '#853D94',
			container: '#A85CB8',
			onContainer: '#000',
		},
		darkColors: {
			main: '#853D94',
			container: '#A85CB8',
			onContainer: '#000',
		},
	},
	cyan: {
		colorName: 'cyan',
		lightColors: {
			main: '#4E57A6',
			container: '#6E77CA',
			onContainer: '#000',
		},
		darkColors: {
			main: '#4E57A6',
			container: '#6E77CA',
			onContainer: '#000',
		},
	},
}

export const getCalendarIdByColor = (color: string): string => {
	return COLOR_TO_CALENDAR_MAP[color] || 'blue'
}
