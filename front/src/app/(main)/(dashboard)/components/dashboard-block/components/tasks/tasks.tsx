'use client'

import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'

import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import classes from './tasks.module.scss'

export const TasksBlock = () => {
	const { sectionRef, listHeight } = useSectionHeight(0.73)

	return (
		<section className={classes.tasks} ref={sectionRef}>
			<h2>Tasks for today:</h2>
			<ul className={classes.tasksList} style={{ maxHeight: `${listHeight}px` }}>
				<li>
					<CheckboxCard label='Task 1' checked={false} onCheck={() => {}} withBorder={true} />
				</li>
				<li>
					<CheckboxCard label='Task 2' checked={true} onCheck={() => {}} withBorder={true} />
				</li>
				<li>
					<CheckboxCard label='Task 3' checked={true} onCheck={() => {}} withBorder={true} />
				</li>
				<li>
					<CheckboxCard label='Task 4' checked={true} onCheck={() => {}} withBorder={true} />
				</li>
				<li>
					<CheckboxCard label='Task 5' checked={true} onCheck={() => {}} withBorder={true} />
				</li>
			</ul>
		</section>
	)
}
