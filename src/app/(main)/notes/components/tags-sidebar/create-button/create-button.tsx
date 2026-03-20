'use client'

import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import classes from './create-button.module.scss'

interface CreateButtonProps {
	setIsModalVisible: (status: boolean) => void
}

export const CreateButton = ({ setIsModalVisible }: CreateButtonProps) => {
	return (
		<button className={classes.createButton} onClick={() => setIsModalVisible(true)}>
			<PlusIcon />
			<span>New tag</span>
		</button>
	)
}
