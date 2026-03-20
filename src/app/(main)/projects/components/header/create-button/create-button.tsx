'use client'

import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import Link from 'next/link'
import classes from './create-button.module.scss'

export const CreateButton = () => {
	return (
		<Link href='/projects/new' className={classes.createButton} onClick={() => {}}>
			<PlusIcon />
			<span>New project</span>
		</Link>
	)
}
