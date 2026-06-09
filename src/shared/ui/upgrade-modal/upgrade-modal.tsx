'use client'

import { createCheckoutSession } from '@/app/actions/stripe'
import { PRO_FEATURES } from '@/shared/constants/pro-features'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '../modal/modal'
import classes from './upgrade-modal.module.scss'

interface UpgradeModalProps {
	isOpen: boolean
	onClose: () => void
	triggerFeatureId: string
}

export const UpgradeModal = ({ isOpen, onClose, triggerFeatureId }: UpgradeModalProps) => {
	const { user } = useUser()
	const [isRedirecting, setIsRedirecting] = useState(false)

	const pathname = usePathname()

	const triggeredFeature = PRO_FEATURES[triggerFeatureId]
	const otherFeatures = Object.values(PRO_FEATURES).filter(feature => feature.id !== triggerFeatureId)

	const handleUpgrade = async () => {
		if (!user?.$id || !user?.email) {
			toast.error('User profile data not loaded yet')
			return
		}

		try {
			setIsRedirecting(true)
			toast.loading('Redirecting to Stripe Checkout...')

			const checkoutUrl = await createCheckoutSession(user.$id, user.email, pathname)

			if (checkoutUrl) {
				window.location.href = checkoutUrl
			}
		} catch {
			toast.error('Failed to launch pro payment session')
			setIsRedirecting(false)
		}
	}

	return (
		<Modal isVisible={isOpen} onClose={onClose}>
			<div className={classes.paywallContainer}>
				<div className={classes.header}>
					<span className={classes.badge}>Focusphere PRO</span>
					<h2>Unlock the full power of focus</h2>
				</div>

				{triggeredFeature && (
					<div className={classes.triggerBox}>
						<div className={classes.featureIcon}>{triggeredFeature.icon}</div>
						<div>
							<h4>{triggeredFeature.title}</h4>
							<p>{triggeredFeature.description}</p>
						</div>
					</div>
				)}

				<hr className={classes.divider} />

				<div className={classes.othersList}>
					<h5>Also included in your subscription:</h5>
					{otherFeatures.map(feature => (
						<div key={feature.id} className={classes.smallFeatureRow}>
							<span>{feature.icon}</span>
							<div>
								<h6>{feature.title}</h6>
								<p>{feature.description}</p>
							</div>
						</div>
					))}
				</div>

				<div className={classes.actions}>
					<button onClick={onClose} className={classes.backBtn} disabled={isRedirecting}>
						Cancel
					</button>
					<button onClick={handleUpgrade} className={classes.checkoutBtn} disabled={isRedirecting}>
						{isRedirecting ? 'Processing...' : 'Start 7-day free trial'}
					</button>
				</div>
			</div>
		</Modal>
	)
}
