import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Sign up - Focusphere',
	description:
		'Sign up to Focusphere to manage your projects, sync your calendar, and stay focused. Access your workspace and boost your productivity.',
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
