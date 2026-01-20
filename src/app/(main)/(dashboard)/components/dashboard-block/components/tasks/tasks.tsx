'use client'

import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'

import { useTasksByToday } from '@/shared/hooks/daily-tasks/use-tasks-by-today'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { BeatLoader } from 'react-spinners'
import classes from './tasks.module.scss'

export const TasksBlock = () => {
	const { sectionRef, listHeight } = useSectionHeight(0.72)
	const { tasks, isLoading, handleToggleTask } = useTasksByToday()

	return (
		<section className={classes.tasks} ref={sectionRef}>
			<h2>Tasks for today:</h2>
			{tasks.length === 0 && !isLoading ? (
				<p className={classes.noTasksMessage}>No tasks for today</p>
			) : tasks.length === 0 ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<ul className={classes.tasksList} style={{ maxHeight: `${listHeight}px` }}>
					{tasks.map(item => (
						<li key={item.$id}>
							<CheckboxCard
								label={item.title}
								checked={item.isCompleted}
								onCheck={checked => handleToggleTask(item.$id, checked)}
								withBorder={true}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
