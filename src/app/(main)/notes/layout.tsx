import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Notes - Focusphere',
	description:
		'Build your personal knowledge base with Focusphere Notes. Capture ideas, create rich-text documentation, and keep your thoughts organized in one powerful workspace.',
}

export default function NotesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
