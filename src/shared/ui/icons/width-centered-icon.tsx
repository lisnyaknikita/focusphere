import { SVGProps } from 'react'

export const WidthCenteredIcon = (props: SVGProps<SVGSVGElement>) => (
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
		<line x1='4' y1='4' x2='4' y2='20' />
		<line x1='20' y1='4' x2='20' y2='20' />
		<line x1='8' y1='8' x2='16' y2='8' />
		<line x1='8' y1='12' x2='16' y2='12' />
		<line x1='8' y1='16' x2='16' y2='16' />
	</svg>
)
