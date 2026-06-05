'use client'

import { useProStatus } from '@/shared/hooks/use-pro-status/use-pro-status'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { createContext, ReactNode, useContext, useState } from 'react'
import { UpgradeModal } from '../ui/upgrade-modal/upgrade-modal'

interface BillingContextType {
	isPro: boolean
	isBillingLoading: boolean
	stripeCustomerId: string | null
	openPaywall: (featureId: string) => void
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export const BillingProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useUser()
	const { isPro, isBillingLoading, stripeCustomerId } = useProStatus(user?.$id ?? '')

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeFeatureId, setActiveFeatureId] = useState<string>('')

	const openPaywall = (featureId: string) => {
		setActiveFeatureId(featureId)
		setIsModalOpen(true)
	}

	const closePaywall = () => {
		setIsModalOpen(false)
		setActiveFeatureId('')
	}

	return (
		<BillingContext.Provider value={{ isPro, isBillingLoading, stripeCustomerId, openPaywall }}>
			{children}
			<UpgradeModal isOpen={isModalOpen} onClose={closePaywall} triggerFeatureId={activeFeatureId} />
		</BillingContext.Provider>
	)
}

export const useBilling = () => {
	const context = useContext(BillingContext)
	if (!context) throw new Error('useBilling must be used within BillingProvider')
	return context
}
