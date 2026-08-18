import { SVGProps } from 'react'

export const ChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox='0 0 24 24'
		width='12'
		height='12'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='M15 18l-6-6 6-6' />
	</svg>
)
