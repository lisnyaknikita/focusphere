'use server'

import { APP_URL } from '@/shared/constants/app'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2026-05-27.dahlia',
})

export async function createCheckoutSession(userId: string, userEmail: string, currentPath: string) {
	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [
				{
					price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
					quantity: 1,
				},
			],
			subscription_data: {
				trial_period_days: 7,
			},
			client_reference_id: userId,
			customer_email: userEmail,

			success_url: `${APP_URL}${currentPath}?success=true`,
			cancel_url: `${APP_URL}${currentPath}`,
		})

		return session.url
	} catch (error) {
		console.error('Stripe session creation error:', error)
		throw new Error('Failed to create payment session')
	}
}

export async function createCustomerPortalSession(stripeCustomerId: string, currentPath: string) {
	try {
		const session = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId,
			return_url: `${APP_URL}${currentPath}`,
		})

		return session.url
	} catch (error) {
		console.error('Stripe Portal Error:', error)
		throw new Error('Failed to create portal session')
	}
}
