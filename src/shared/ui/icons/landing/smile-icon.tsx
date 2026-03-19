import { SVGProps } from 'react'

export const SmileIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<circle cx='12' cy='12' r='10' />
		<path d='M8 15h8' />
		<path d='M8 9h.01' />
		<path d='M16 9h.01' />
	</svg>
)
