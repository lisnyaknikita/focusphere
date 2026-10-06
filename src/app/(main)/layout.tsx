import { AuthGuard } from '@/shared/auth-guard/auth-guard'
import { ClientLayout } from '@/shared/client-layout/client-layout'
import { Sidebar } from '@/shared/ui/sidebar/sidebar'
import '../globals.scss'

import classes from './layout.module.scss'

export default async function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClientLayout>
			<AuthGuard>
				<Sidebar />
				<main className={classes.mainContent}>{children}</main>
			</AuthGuard>
		</ClientLayout>
	)
}
