'use client'

import { useEffect, useRef, useState } from 'react'
import classes from './editable-username.module.scss'

export const EditableUsername = () => {
	const [isEditing, setIsEditing] = useState(false)
	const [username, setUsername] = useState('Ivan')
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
		}
	}, [isEditing])

	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setIsEditing(false)
		}
	}

	return (
		<div className={classes.wrapper}>
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
				<div className={classes.usernameWrapper} onClick={() => setIsEditing(true)}>
					<span className={classes.username}>{username}</span>
					<svg className={classes.icon} fill='none' viewBox='0 0 19 23' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='m14.473 5.0741c-0.3682-0.30848-0.8438-0.45823-1.3223-0.41637-0.4786 0.04187-0.9209 0.27193-1.23 0.63966l-8.0978 9.6505 0.22329 2.5522 2.5523-0.2233 8.0978-9.6505c0.3084-0.36826 0.458-0.84381 0.4162-1.3223-0.0419-0.47848-0.2719-0.92082-0.6395-1.2299zm-8.3721 11.242-1.1456 0.1003-0.10023-1.1457 6.0502-7.2047 1.2459 1.0454-6.0502 7.2047zm7.8295-9.3328-1.1395 1.358-1.2434-1.0456 1.1392-1.3559c0.1386-0.16521 0.3372-0.26858 0.552-0.28738 0.2149-0.0188 0.4284 0.04852 0.5936 0.18715s0.2686 0.33721 0.2874 0.55205c0.0188 0.21485-0.0485 0.42836-0.1872 0.59357l-0.0021-0.00182z'
							fill='#fff'
							fillOpacity='.49'
						/>
					</svg>
				</div>
			)}
		</div>
	)
}
