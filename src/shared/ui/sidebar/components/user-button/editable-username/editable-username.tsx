'use client'

import { account } from '@/lib/appwrite'
import { updateLegacyNames } from '@/lib/projects/chat/chat'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { useEffect, useRef, useState } from 'react'
import classes from './editable-username.module.scss'

interface EditableUsernameProps {
	displayName: string
	onNameUpdated: (newName: string) => void
}

export const EditableUsername = ({ displayName, onNameUpdated }: EditableUsernameProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [username, setUsername] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const inputRef = useRef<HTMLInputElement | null>(null)

	const { user } = useUser()

	useEffect(() => {
		setUsername(displayName)
	}, [displayName])

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
		}
	}, [isEditing])

	const handleNameUpdate = async (newName: string) => {
		if (newName.trim() === displayName || newName.trim() === '') {
			setUsername(displayName)
			setIsEditing(false)
			return
		}

		const previousName = displayName
		setIsLoading(true)

		try {
			await account.updateName({ name: newName.trim() })

			if (user?.$id) {
				updateLegacyNames(user.$id, newName.trim())
			}

			setUsername(newName.trim())
			onNameUpdated(newName.trim())
		} catch (error) {
			console.error('Failed to update username:', error)
			alert('Failed to update username. Please try again.')

			setUsername(previousName)
		} finally {
			setIsEditing(false)
			setIsLoading(false)
		}
	}

	const handleBlur = () => {
		setIsEditing(false)
		handleNameUpdate(username)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setIsEditing(false)
			handleNameUpdate(username)
		}
	}

	return (
		<div className={classes.wrapper} title={username}>
			{isEditing ? (
				<input
					ref={inputRef}
					className={classes.usernameInput}
					value={username}
					onChange={e => setUsername(e.target.value)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
				/>
			) : (
				<div className={classes.usernameWrapper} onClick={() => !isLoading && setIsEditing(true)}>
					<span className={classes.username}>{isLoading ? 'Saving...' : username}</span>
					{!isLoading && <EditIcon className={classes.icon} />}
				</div>
			)}
		</div>
	)
}
