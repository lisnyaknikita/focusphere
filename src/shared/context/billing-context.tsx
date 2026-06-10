'use client'

import { useProStatus } from '@/shared/hooks/use-pro-status/use-pro-status'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { createContext, ReactNode, useContext, useState } from 'react'
import { UpgradeModal } from '../ui/upgrade-modal/upgrade-modal'

const DISABLE_PAYWALL = true // Set to false to enable Stripe billing and paywalls

interface BillingContextType {
	isPro: boolean
	isBillingLoading: boolean
	stripeCustomerId: string | null
	openPaywall: (featureId: string) => void
	isBillingEnabled: boolean
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export const BillingProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useUser()
	const { isPro: dbIsPro, isBillingLoading: isProLoading, stripeCustomerId } = useProStatus(user?.$id ?? '')

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeFeatureId, setActiveFeatureId] = useState<string>('')

	const openPaywall = (featureId: string) => {
		if (DISABLE_PAYWALL) return
		setActiveFeatureId(featureId)
		setIsModalOpen(true)
	}

	const closePaywall = () => {
		setIsModalOpen(false)
		setActiveFeatureId('')
	}

	const isPro = DISABLE_PAYWALL ? true : dbIsPro
	const isBillingLoading = DISABLE_PAYWALL ? false : !user || isProLoading
	const isBillingEnabled = !DISABLE_PAYWALL

	return (
		<BillingContext.Provider value={{ isPro, isBillingLoading, stripeCustomerId, openPaywall, isBillingEnabled }}>
			{children}
			{!DISABLE_PAYWALL && (
				<UpgradeModal isOpen={isModalOpen} onClose={closePaywall} triggerFeatureId={activeFeatureId} />
			)}
		</BillingContext.Provider>
	)
}

export const useBilling = () => {
	const context = useContext(BillingContext)
	if (!context) throw new Error('useBilling must be used within BillingProvider')
	return context
}
