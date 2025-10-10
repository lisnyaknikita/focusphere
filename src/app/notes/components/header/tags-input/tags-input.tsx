import { ChangeEvent, KeyboardEvent, useState } from 'react'
import classes from './tags-input.module.scss'

export const TagsInput = () => {
	const [tags, setTags] = useState<string[]>([])
	const [inputValue, setInputValue] = useState('')

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === ' ') {
			e.preventDefault()
			setInputValue(prev => {
				if (prev.endsWith('-')) return prev
				return prev + '-'
			})
			return
		}

		if (e.key === 'Enter' && inputValue.trim()) {
			e.preventDefault()

			const newTag = inputValue.trim().replace(/^-+|-+$/g, '')

			if (newTag && !tags.includes(newTag)) {
				setTags([...tags, newTag])
			}
			setInputValue('')
		}
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value.toLowerCase())
	}

	const removeTag = (tag: string) => {
		setTags(tags.filter(t => t !== tag))
	}

	return (
		<div className={classes.tagsInputWrapper}>
			<div className={classes.tagsScroller}>
				<div className={classes.tags}>
					{tags.map(tag => (
						<span key={tag} className={classes.tag}>
							#{tag}
							<button type='button' onClick={() => removeTag(tag)}>
								×
							</button>
						</span>
					))}
				</div>
				<input
					className={classes.tagInput}
					type='text'
					placeholder='Add a tag'
					value={inputValue}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
			</div>
		</div>
	)
}
