const COLOR_TO_CALENDAR_MAP: Record<string, string> = {
	'#D79716': 'gold',
	'#D71616': 'red',
	'#17720F': 'green',
	'#1351AE': 'blue',
	'#97107A': 'purple',
	'#16ADD7': 'cyan',
}

export const getCalendarIdByColor = (color: string): string => {
	return COLOR_TO_CALENDAR_MAP[color] || 'blue'
}
