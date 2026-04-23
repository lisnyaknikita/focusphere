import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Planner - Focusphere',
	description:
		'Plan your week, track your progress, and stay on top of your most important work. Focusphere Planner helps you organize tasks and turn your goals into actionable plans.',
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
