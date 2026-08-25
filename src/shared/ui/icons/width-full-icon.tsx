import { SVGProps } from 'react'

export const WidthFullIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<polyline points='7 15 3 12 7 9' />
		<polyline points='17 15 21 12 17 9' />
		<line x1='3' y1='12' x2='21' y2='12' />
	</svg>
)
