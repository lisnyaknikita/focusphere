'use client'

import { getLabelColor } from '@/shared/utils/get-label-color/get-label-color'
import { useState } from 'react'
import classes from './task-labels-editor.module.scss'

interface TaskLabelsEditorProps {
	labels: string[]
	onChange: (updatedLabels: string[]) => void
}

export const TaskLabelsEditor = ({ labels = [], onChange }: TaskLabelsEditorProps) => {
	const [newLabelInput, setNewLabelInput] = useState('')

	const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			const value = newLabelInput.trim().replace(/,/g, '')

			if (value && !labels.includes(value)) {
				onChange([...labels, value])
			}
			setNewLabelInput('')
		}
	}

	const handleRemoveLabel = (labelToRemove: string) => {
		onChange(labels.filter(label => label !== labelToRemove))
	}

	return (
		<div className={classes.labelsEditor}>
			{labels.length === 0 && <span className={classes.emptyLabelsText}>No labels yet</span>}

			{labels.length > 0 && (
				<div className={classes.labelsList}>
					{labels.map(label => {
						const color = getLabelColor(label)
						return (
							<span key={label} className={classes.modalLabelTag} style={{ borderColor: color }}>
								{label}
								<button
									type='button'
									onClick={() => handleRemoveLabel(label)}
									className={classes.removeLabelBtn}
									title='Remove label'
								>
									&times;
								</button>
							</span>
						)
					})}
				</div>
			)}
			<input
				type='text'
				placeholder='Add label...'
				value={newLabelInput}
				onChange={e => setNewLabelInput(e.target.value)}
				onKeyDown={handleLabelKeyDown}
				className={classes.labelInput}
			/>
		</div>
	)
}
