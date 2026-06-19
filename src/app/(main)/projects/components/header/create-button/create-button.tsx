'use client'

import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import clsx from 'clsx'
import Link from 'next/link'
import classes from './create-button.module.scss'

interface CreateButtonProps {
	disabled?: boolean
	onClick?: () => void
}

export const CreateButton = ({ disabled, onClick }: CreateButtonProps) => {
	const content = (
		<>
			<PlusIcon />
			<span>New project</span>
		</>
	)

	if (disabled) {
		return (
			<button type='button' onClick={onClick} className={clsx(classes.createButton, classes.disabled)}>
				{content}
			</button>
		)
	}

	return (
		<Link href='/projects/new' className={classes.createButton}>
			{content}
		</Link>
	)
}
