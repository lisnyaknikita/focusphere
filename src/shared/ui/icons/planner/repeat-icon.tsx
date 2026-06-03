import { SVGProps } from 'react'

export const RepeatIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='var(--text)'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='m17 2 4 4-4 4' />
		<path d='M3 11v-1a4 4 0 0 1 4-4h14' />
		<path d='m7 22-4-4 4-4' />
		<path d='M21 13v1a4 4 0 0 1-4 4H3' />
	</svg>
)
