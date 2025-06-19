import Link from 'next/link'
import classes from './logo.module.scss'

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
			<span className={audioWide.className}>{isCollapsed ? '' : 'focusphere'}</span>
		</Link>
	)
}
