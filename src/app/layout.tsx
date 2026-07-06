import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Toaster } from 'sonner'

import Script from 'next/script'
import './globals.scss'

const notoSans = Noto_Sans({
	variable: '--font-geist-sans',
	subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
	title: 'Focusphere | Your Minimalist Deep Work Workspace',
	description:
		'Stop app-switching. Focusphere brings your calendar, tasks, notes, and focus tools into one clean dashboard. Organize your life and boost your productivity today.',
	keywords: [
		'productivity app',
		'time blocking',
		'weekly goals',
		'task manager',
		'kanban-board',
		'team-chat',
		'google calendar sync',
		'pomodoro timer',
		'deep work',
	],
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var savedTheme = localStorage.getItem('theme');
									var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
									var isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
									document.documentElement.classList.toggle('dark', isDark);
									document.documentElement.classList.toggle('light', !isDark);
								} catch (e) {}
							})();
						`,
					}}
				/>
				<Script defer src='https://cloud.umami.is/script.js' data-website-id='e247f637-575b-4bd3-b79c-c573760b74c9' />
			</head>
			<body className={`${notoSans.variable}`}>
				{children} <Toaster position='bottom-right' richColors />
			</body>
		</html>
	)
}
