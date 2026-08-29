import { ArrowIcon } from '@/shared/ui/icons/landing/arrow-icon'
import { DollarIcon } from '@/shared/ui/icons/landing/dollar-icon'
import { ReflectIcon } from '@/shared/ui/icons/landing/reflect-icon'
import { SwitchingIcon } from '@/shared/ui/icons/landing/switching-icon'
import { TeamIcon } from '@/shared/ui/icons/landing/team-icon'
import classes from './problem.module.scss'

const problems = [
	{
		icon: <DollarIcon />,
		text: 'Paying $50+/mo across 5 separate apps just to manage your daily work, tasks, and notes.',
	},
	{
		icon: <SwitchingIcon />,
		text: 'Losing your flow state to constant context-switching across multiple standalone applications.',
	},
	{
		icon: <ReflectIcon />,
		text: 'Brilliant thoughts disappearing into random messaging apps or sticky notes with no quick way to capture them.',
	},
	{
		icon: <TeamIcon />,
		text: 'Tasks live in one tool, discussions in another, and deadlines get lost in between.',
	},
]

export const Problem = () => {
	return (
		<section className={classes.problem} id='problems'>
			<div className={classes.container}>
				<h2 className={classes.title}>Drowning in app fatigue and context switching?</h2>
				<div className={classes.grid}>
					{problems.map((problem, index) => (
						<div key={index} className={classes.card}>
							<div className={classes.icon}>{problem.icon}</div>
							<p className={classes.text}>{problem.text}</p>
						</div>
					))}
				</div>
				<div className={classes.transition}>
					<p className={classes.transitionText}>We built Focusphere to unify your entire workflow in one place.</p>
					<div className={classes.arrow}>
						<ArrowIcon />
					</div>
				</div>
			</div>
		</section>
	)
}
