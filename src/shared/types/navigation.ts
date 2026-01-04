import { ReactElement } from 'react'

export type NavItem = {
	label: string
	href?: string
	iconSvg: ReactElement
	iconAlt?: string
	isButton?: boolean
	showIconSvg?: ReactElement
	hideIconSvg?: ReactElement
}
