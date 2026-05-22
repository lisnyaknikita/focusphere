const LIGHT_BORDER_PALETTE = [
	'#403294',
	'#0052CC',
	'#006644',
	'#BF2600',
	'#D09A00',
	'#006677',
	'#42526E',
	'#A55200',
	'#9D174D',
	'#047857',
	'#1E40AF',
	'#6D28D9',
]

const DARK_BORDER_PALETTE = [
	'#8472FC',
	'#4C9AFF',
	'#36B37E',
	'#FF5630',
	'#FFAB00',
	'#00B8D9',
	'#A5ADBA',
	'#FF991F',
	'#F472B6',
	'#34D399',
	'#60A5FA',
	'#A78BFA',
]

export const getLabelColor = (label: string): string => {
	if (!label) return '#71717a'

	let hash = 0
	const p = 31
	const m = 1e9 + 9
	for (let i = 0; i < label.length; i++) {
		hash = (hash * p + label.charCodeAt(i)) % m
	}

	const goldenRatioConjugate = 0.618033988749895
	const fraction = (hash * goldenRatioConjugate) % 1
	const index = Math.floor(fraction * LIGHT_BORDER_PALETTE.length)

	const isDarkMode =
		typeof document !== 'undefined' &&
		(document.documentElement.classList.contains('dark') || document.body.classList.contains('dark'))

	return isDarkMode ? DARK_BORDER_PALETTE[index] : LIGHT_BORDER_PALETTE[index]
}
