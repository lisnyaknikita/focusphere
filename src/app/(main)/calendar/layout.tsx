import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Calendar - Focusphere',
	description:
		'Your unified workspace calendar. View and manage events in month, week, or day formats, and stay on top of your tasks with deep integration.',
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
