import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Dashboard - Focusphere',
	description:
		'Your daily productivity overview. Track today&apos;s events and tasks, stay organized, and get inspired with daily motivational quotes on your Focusphere dashboard.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
