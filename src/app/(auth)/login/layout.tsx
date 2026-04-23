import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Sign in - Focusphere',
	description:
		'Sign in to Focusphere to manage your projects, sync your calendar, and stay focused. Access your workspace and boost your productivity.',
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
