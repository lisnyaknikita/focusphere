import { SVGProps } from 'react'

export const SidebarIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='var(--text)'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<rect width='18' height='18' x='3' y='3' rx='2' />
		<path d='M15 3v18' />
	</svg>
)
