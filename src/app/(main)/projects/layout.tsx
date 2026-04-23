import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Projects - Focusphere',
	description:
		'Manage complex workflows with Focusphere Projects. Organize your big ideas into Kanban boards, track progress through stages, and stay aligned with your long-term goals.',
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
