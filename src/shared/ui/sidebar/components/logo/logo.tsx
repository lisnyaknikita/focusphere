import Link from 'next/link'
import classes from './logo.module.scss'

import clsx from 'clsx'
import { Audiowide } from 'next/font/google'
import { usePathname } from 'next/navigation'
import LogoIcon from './components/logo-icon/logo-icon'

const audioWide = Audiowide({
	subsets: ['latin'],
	weight: '400',
})

const AUTH_PATHS = ['/login', '/signup', '/forgot', '/reset-password', '/verify']

type LogoProps = {
	isCollapsed?: boolean
}

export const Logo = ({ isCollapsed }: LogoProps) => {
	const pathname = usePathname()
	const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path))
	const href = isAuthPage ? '/' : '/dashboard'

	return (
		<Link href={href} className={classes.logoLink}>
			<LogoIcon />
			<span className={clsx(audioWide.className, isCollapsed && 'collapsed')}>{isCollapsed ? '' : 'focusphere'}</span>
		</Link>
	)
}
