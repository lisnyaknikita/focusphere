import clsx from 'clsx'

import classes from './user-button.module.scss'

interface UserButtonProps {
	isCollapsed: boolean
}

export const UserButton = ({ isCollapsed }: UserButtonProps) => {
	return <button className={clsx(classes.userButton, isCollapsed && 'collapsed')}>N</button>
}
