import { ArrowIcon } from '@/shared/ui/icons/landing/arrow-icon'
import { ReflectIcon } from '@/shared/ui/icons/landing/reflect-icon'
import { SmileIcon } from '@/shared/ui/icons/landing/smile-icon'
import { SwitchingIcon } from '@/shared/ui/icons/landing/switching-icon'
import { TeamIcon } from '@/shared/ui/icons/landing/team-icon'
import classes from './problem.module.scss'

const problems = [
	{
		icon: <SwitchingIcon />,
		text: 'Switching between 5 different apps just to plan your day',
	},
	{
		icon: <SmileIcon />,
		text: 'Losing focus every 10 minutes',
	},
	{
		icon: <TeamIcon />,
		text: "Your team has no idea what's happening",
	},
	{
		icon: <ReflectIcon />,
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
						<ArrowIcon />
					</div>
				</div>
			</div>
		</section>
	)
}
