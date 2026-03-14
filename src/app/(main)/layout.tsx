import { AuthGuard } from '@/shared/auth-guard/auth-guard'
import { ClientLayout } from '@/shared/client-layout/client-layout'
import { BackgroundSoundProvider } from '@/shared/context/background-sound-context'
import { TimerProvider } from '@/shared/context/timer-context'
import { Sidebar } from '@/shared/ui/sidebar/sidebar'
import '../globals.scss'

export default async function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClientLayout>
			<AuthGuard>
				<BackgroundSoundProvider>
					<TimerProvider>
						<Sidebar />
						{children}
					</TimerProvider>
				</BackgroundSoundProvider>
			</AuthGuard>
		</ClientLayout>
	)
}
