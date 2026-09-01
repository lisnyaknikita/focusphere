import { SVGProps } from 'react'

export const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='var(--text)'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='M8 2v3' />
		<path d='M16 2v3' />
		<rect x='3' y='3' width='18' height='18' rx='2' />
		<path d='M3 9h18' />
	</svg>
)
