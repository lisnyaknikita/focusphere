import Link from 'next/link'
import classes from './logo.module.scss'

import clsx from 'clsx'
import { Audiowide } from 'next/font/google'
import LogoIcon from './components/logo-icon/logo-icon'

const audioWide = Audiowide({
	subsets: ['latin'],
	weight: '400',
})

type LogoProps = {
	isCollapsed: boolean
}

export const Logo = ({ isCollapsed }: LogoProps) => {
	return (
		<Link href='/' className={classes.logoLink}>
			<LogoIcon />
			<span className={clsx(audioWide.className, isCollapsed && 'collapsed')}>{isCollapsed ? '' : 'focusphere'}</span>
		</Link>
	)
}
