import { SVGProps } from 'react'

export const StatsIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg width='26' height='26' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
		<path
			d='M18 20V10M12 20V4M6 20V14'
			stroke='var(--text)'
			strokeWidth='2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)
