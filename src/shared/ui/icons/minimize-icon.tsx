import { SVGProps } from 'react'

export const MinimizeIcon = (props: SVGProps<SVGSVGElement>) => (
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
		<path d='m14 10 7-7' />
		<path d='M20 10h-6V4' />
		<path d='m3 21 7-7' />
		<path d='M4 14h6v6' />
	</svg>
)
