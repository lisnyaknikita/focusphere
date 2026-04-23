import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Journal - Focusphere',
	description:
		'Document your thoughts and daily reflections with Focusphere Journal. A private space for mindful writing, tracking your personal growth, and capturing important ideas.',
}

export default function JournalLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
