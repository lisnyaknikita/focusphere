'use client'

import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { useState } from 'react'
import classes from './user-button.module.scss'

interface UserButtonProps {
	isCollapsed: boolean
}

export const UserButton = ({ isCollapsed }: UserButtonProps) => {
	const [isVisible, setIsVisible] = useState(false)

	return (
		<>
			<button className={clsx(classes.userButton, isCollapsed && 'collapsed')} onClick={() => setIsVisible(true)}>
				N
			</button>

			<Modal isVisible={isVisible} onClose={() => setIsVisible(false)}>
				Modal
			</Modal>
		</>
	)
}
