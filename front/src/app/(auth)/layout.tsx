import { Noto_Sans } from 'next/font/google'

import '../globals.scss'

const notoSans = Noto_Sans({
	variable: '--font-geist-sans',
	subsets: ['latin', 'cyrillic'],
})

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <div className={`${notoSans.variable}`}>{children}</div>
}
