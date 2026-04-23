import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Focus & Timer - Focusphere',
	description:
		'Reach your peak productivity with the Focus Timer. Set deep work sessions, use Pomodoro techniques, and eliminate distractions to stay in the flow and ship faster.',
}

export default function FocusLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
