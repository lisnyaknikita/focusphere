import classes from './problem.module.scss'

const problems = [
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<rect x='3' y='3' width='7' height='7' />
				<rect x='14' y='3' width='7' height='7' />
				<rect x='14' y='14' width='7' height='7' />
				<rect x='3' y='14' width='7' height='7' />
			</svg>
		),
		text: 'Switching between 5 different apps just to plan your day',
	},
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<circle cx='12' cy='12' r='10' />
				<path d='M8 15h8' />
				<path d='M8 9h.01' />
				<path d='M16 9h.01' />
			</svg>
		),
		text: 'Losing focus every 10 minutes',
	},
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
				<circle cx='9' cy='7' r='4' />
				<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
				<path d='M16 3.13a4 4 0 0 1 0 7.75' />
			</svg>
		),
		text: "Your team has no idea what's happening",
	},
	{
		icon: (
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
				<polyline points='14,2 14,8 20,8' />
				<line x1='16' y1='13' x2='8' y2='13' />
				<line x1='16' y1='17' x2='8' y2='17' />
			</svg>
		),
		text: 'You never find time to reflect',
	},
]

export const Problem = () => {
	return (
		<section className={classes.problem} id='problems'>
			<div className={classes.container}>
				<h2 className={classes.title}>Sound familiar?</h2>
				<div className={classes.grid}>
					{problems.map((problem, index) => (
						<div key={index} className={classes.card}>
							<div className={classes.icon}>{problem.icon}</div>
							<p className={classes.text}>{problem.text}</p>
						</div>
					))}
				</div>
				<div className={classes.transition}>
					<p className={classes.transitionText}>We built Focusphere to fix all of that.</p>
					<div className={classes.arrow}>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<line x1='12' y1='5' x2='12' y2='19' />
							<polyline points='19,12 12,19 5,12' />
						</svg>
					</div>
				</div>
			</div>
		</section>
	)
}
