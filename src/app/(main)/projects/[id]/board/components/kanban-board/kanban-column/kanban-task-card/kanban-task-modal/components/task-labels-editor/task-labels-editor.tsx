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

	const processAndAddLabels = (rawInput: string): void => {
		const cleanedInput = rawInput.trim()
		if (!cleanedInput) return

		const candidates = cleanedInput
			.split(',')
			.map(item => item.trim())
			.filter(Boolean)

		const uniqueNewLabels = candidates.filter(label => !labels.includes(label))

		if (uniqueNewLabels.length > 0) {
			const mergedLabels = Array.from(new Set([...labels, ...uniqueNewLabels]))
			onChange(mergedLabels)
		}

		setNewLabelInput('')
	}

	const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			processAndAddLabels(newLabelInput)
		}
	}

	const handleBlur = () => {
		processAndAddLabels(newLabelInput)
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
									aria-label={`Remove label ${label}`}
									title={`Remove label ${label}`}
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
				onBlur={handleBlur}
				className={classes.labelInput}
			/>
		</div>
	)
}
