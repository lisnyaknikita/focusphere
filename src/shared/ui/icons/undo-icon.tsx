import { SVGProps } from 'react'

export const UndoIcon = (props: SVGProps<SVGSVGElement>) => (
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
		<path d='M3 7v6h6' />
		<path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
	</svg>
)
