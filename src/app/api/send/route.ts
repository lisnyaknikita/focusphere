import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
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
	} catch (error) {
		return Response.json({ error }, { status: 500 })
	}
}
