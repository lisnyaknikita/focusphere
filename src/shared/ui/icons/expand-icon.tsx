import { SVGProps } from 'react'

export const ExpandIcon = (props: SVGProps<SVGSVGElement>) => (
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
		<path d='M15 3h6v6' />
		<path d='m21 3-7 7' />
		<path d='m3 21 7-7' />
		<path d='M9 21H3v-6' />
	</svg>
)
