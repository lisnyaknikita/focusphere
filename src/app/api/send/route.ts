import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
	if (!resend) {
		console.error('RESEND_API_KEY is missing in environment variables.')
		return Response.json({ error: 'Mail service is not configured' }, { status: 500 })
	}

	try {
		const { type, message, userEmail, userName } = await req.json()

		const data = await resend.emails.send({
			from: 'Focusphere Feedback <onboarding@resend.dev>',
			to: ['lisnyak.nikita@gmail.com'],
			subject: `Focusphere: ${type.toUpperCase()}`,
			text: `
        New feedback from Focusphere
        
        Type: ${type}
        User: ${userName || 'Guest'} (${userEmail || 'no-email'})
        
        Message:
        ${message}
      `,
		})

		return Response.json(data)
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		console.error('[FEEDBACK_API_ERROR]:', errorMessage)

		return Response.json({ error: errorMessage }, { status: 500 })
	}
}
