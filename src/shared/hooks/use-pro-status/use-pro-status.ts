import { db } from '@/lib/appwrite'
import { useEffect, useState } from 'react'

interface SubscriptionDocument {
	userId: string
	isPro: boolean
	stripeSubscriptionId?: string
	stripeCustomerId?: string
}

export const useProStatus = (userId: string) => {
	const [isPro, setIsPro] = useState<boolean>(false)
	const [isBillingLoading, setIsBillingLoading] = useState<boolean>(true)
	const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)

	useEffect(() => {
		if (!userId) {
			setIsPro(false)
			setStripeCustomerId(null)
			setIsBillingLoading(false)
			return
		}

		const checkStatus = async () => {
			setIsBillingLoading(true)

			try {
				const subDoc = (await db.getRow({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: process.env.NEXT_PUBLIC_TABLE_SUBSCRIPTIONS!,
					rowId: userId,
				})) as unknown as SubscriptionDocument | null

				setIsPro(!!subDoc?.isPro)
				setStripeCustomerId(subDoc?.stripeCustomerId ?? null)
			} catch {
				setIsPro(false)
				setStripeCustomerId(null)
			} finally {
				setIsBillingLoading(false)
			}
		}

		checkStatus()
	}, [userId])

	return { isPro, isBillingLoading, stripeCustomerId }
}
