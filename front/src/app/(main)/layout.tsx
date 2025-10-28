import { Noto_Sans } from 'next/font/google'

import { ClientLayout } from '@/shared/client-layout/client-layout'
import { Sidebar } from '@/shared/ui/sidebar/sidebar'
import '../globals.scss'

const notoSans = Noto_Sans({
	variable: '--font-geist-sans',
	subsets: ['latin', 'cyrillic'],
})

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body className={`${notoSans.variable}`}>
				<ClientLayout>
					<Sidebar />
					{children}
				</ClientLayout>
			</body>
		</html>
	)
}
