import { useState } from 'react'

import { RadioCard } from '@/shared/ui/radio-card/radio-card'
import { useRouter } from 'next/navigation'
import classes from './new-project-form.module.scss'

export const NewProjectForm = () => {
	const [title, setTitle] = useState('')
	const [projectType, setProjectType] = useState<'solo' | 'team' | null>(null)
	const router = useRouter()

	const handleCreation = (e: React.FormEvent) => {
		e.preventDefault()
		if (!title || !projectType) return

		const projectId = 123

		if (projectType === 'team') {
			router.push(`/projects/new/team?projectId=${projectId}`)
		} else {
			router.push(`/projects/${projectId}/board`)
		}
	}

	return (
		<form className={classes.newProjectForm} onSubmit={handleCreation}>
			<h3 className={classes.formTitle}>Create new project</h3>
			<p className={classes.formSubtitle}>Start organizing your work efficiently</p>
			<div className={classes.titleLabel}>
				<span>Project title</span>
				<input
					type='text'
					placeholder='Enter your project name'
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
			</div>
			<div className={classes.projectTypeLabel}>
				<span>Project type</span>
				<div className={classes.radioButtons}>
					<RadioCard
						value='solo'
						label='Solo project'
						description='Work independently on your tasks'
						checked={projectType === 'solo'}
						name='projectType'
						onChange={value => setProjectType(value as 'solo' | 'team')}
					/>
					<RadioCard
						value='team'
						label='Team project'
						description='Collaborate with team members'
						checked={projectType === 'team'}
						name='projectType'
						onChange={value => setProjectType(value as 'solo' | 'team')}
					/>
				</div>
			</div>
			<button className={classes.createButton}>Create</button>
		</form>
	)
}
