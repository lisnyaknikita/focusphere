'use client'

import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'

import classes from './tasks.module.scss'

export const TasksBlock = () => {
	return (
		<section className={classes.tasks}>
			<h2>Tasks for today:</h2>
			<ul className={classes.tasksList}>
				<li>
					<CheckboxCard label='Task 1' checked={false} onCheck={() => {}} />
				</li>
				<li>
					<CheckboxCard label='Task 2' checked={true} onCheck={() => {}} />
				</li>
				<li>
					<CheckboxCard label='Task 3' checked={true} onCheck={() => {}} />
				</li>
				<li>
					<CheckboxCard label='Task 4' checked={true} onCheck={() => {}} />
				</li>
				<li>
					<CheckboxCard label='Task 5' checked={true} onCheck={() => {}} />
				</li>
			</ul>
		</section>
	)
}
