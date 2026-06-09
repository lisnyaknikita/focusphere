import { headers } from 'next/headers'
import { Client, Databases, Query } from 'node-appwrite'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2026-05-27.dahlia',
})

const appwriteServerClient = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
	.setKey(process.env.APPWRITE_API_KEY!)

const dbServer = new Databases(appwriteServerClient)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const SUB_TABLE_ID = process.env.NEXT_PUBLIC_TABLE_SUBSCRIPTIONS!

export async function POST(req: Request) {
	const body = await req.text()

	const headersList = await headers()
	const signature = headersList.get('stripe-signature')

	if (!signature) {
		return new Response('Missing stripe signature', { status: 400 })
	}

	let event: Stripe.Event

	try {
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

		if (!webhookSecret) {
			return new Response('Webhook secret missing', { status: 500 })
		}

		event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown webhook verification error'
		console.error('❌ Webhook Verification Failed:', errorMessage)
		return new Response(`Webhook Error: ${errorMessage}`, { status: 400 })
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session
		const userId = session.client_reference_id
		const subscriptionId = session.subscription as string
		const customerId = session.customer as string

		if (!userId) {
			return new Response('Missing client_reference_id in checkout session', { status: 400 })
		}

		try {
			const existingSub = await dbServer.listDocuments(DB_ID, SUB_TABLE_ID, [Query.equal('userId', userId)])

			if (existingSub.total > 0) {
				await dbServer.updateDocument(DB_ID, SUB_TABLE_ID, existingSub.documents[0].$id, {
					isPro: true,
					stripeSubscriptionId: subscriptionId,
					stripeCustomerId: customerId,
				})
			} else {
				await dbServer.createDocument(DB_ID, SUB_TABLE_ID, userId, {
					userId: userId,
					isPro: true,
					stripeSubscriptionId: subscriptionId,
					stripeCustomerId: customerId,
				})
			}
		} catch (appwriteError) {
			console.error('Appwrite server error during webhook:', appwriteError)
			return new Response('Database sync failed', { status: 500 })
		}
	}

	if (event.type === 'customer.subscription.deleted') {
		const subscription = event.data.object as Stripe.Subscription
		const subscriptionId = subscription.id

		try {
			const userSub = await dbServer.listDocuments(DB_ID, SUB_TABLE_ID, [
				Query.equal('stripeSubscriptionId', subscriptionId),
			])

			if (userSub.total > 0) {
				await dbServer.updateDocument(DB_ID, SUB_TABLE_ID, userSub.documents[0].$id, {
					isPro: false,
				})
			}
		} catch (appwriteError) {
			console.error('Appwrite server error during sub deletion:', appwriteError)
		}
	}

	if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.paused') {
		const subscription = event.data.object as Stripe.Subscription
		const subscriptionId = subscription.id

		const isPro = subscription.status === 'active' || subscription.status === 'trialing'

		try {
			const userSub = await dbServer.listDocuments(DB_ID, SUB_TABLE_ID, [
				Query.equal('stripeSubscriptionId', subscriptionId),
			])

			if (userSub.total > 0) {
				await dbServer.updateDocument(DB_ID, SUB_TABLE_ID, userSub.documents[0].$id, {
					isPro,
				})
			} else {
				console.warn(`⚠️ subscription.updated: no matching user found for subscriptionId=${subscriptionId}`)
			}
		} catch (appwriteError) {
			console.error('Appwrite server error during subscription update:', appwriteError)
		}
	}

	return new Response('OK', { status: 200 })
}
