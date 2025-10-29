import { ClientLayout } from '@/shared/client-layout/client-layout'
import { Sidebar } from '@/shared/ui/sidebar/sidebar'
import '../globals.scss'

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClientLayout>
			<Sidebar />
			{children}
		</ClientLayout>
	)
}
