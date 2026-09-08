import { db } from '@/lib/appwrite'
import { useQuery } from '@tanstack/react-query'

interface SubscriptionDocument {
	userId: string
	isPro: boolean
	stripeSubscriptionId?: string
	stripeCustomerId?: string
}

export const useProStatus = (userId: string | undefined, enabled = true) => {
	const { data, isLoading } = useQuery({
		queryKey: ['pro-status', userId],
		queryFn: async () => {
			if (!userId) return null
			try {
				const subDoc = (await db.getRow({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: process.env.NEXT_PUBLIC_TABLE_SUBSCRIPTIONS!,
					rowId: userId,
				})) as unknown as SubscriptionDocument | null
				return subDoc
			} catch {
				return null
			}
		},
		enabled: !!userId && enabled,
		staleTime: 15 * 60 * 1000,
	})

	return {
		isPro: !!data?.isPro,
		isBillingLoading: isLoading,
		stripeCustomerId: data?.stripeCustomerId ?? null,
	}
}
