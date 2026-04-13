import { account } from '@/lib/appwrite'
import { OAuthProvider } from 'appwrite'
import { toast } from 'sonner'

type GoogleDate = { date: string } | { dateTime: string; timeZone?: string }

export interface GoogleCalendarEvent {
	id: string
	summary?: string
	description?: string
	colorId?: string
	start: { date?: string; dateTime?: string; timeZone?: string }
	end: { date?: string; dateTime?: string; timeZone?: string }
}

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

class GoogleCalendarService {
	private hasShownAuthError = false

	private showAuthError() {
		if (this.hasShownAuthError) return
		this.hasShownAuthError = true

		toast.error('Google Calendar connection expired', {
			description: 'Please reconnect your Google account to sync events.',
			action: {
				label: 'Reconnect',
				onClick: () => {
					const baseUrl =
						process.env.NODE_ENV === 'production' ? 'https://focusphere-test.vercel.app' : 'http://localhost:3000'
					account.createOAuth2Session(OAuthProvider.Google, `${baseUrl}/dashboard`, `${baseUrl}/login`, [
						'https://www.googleapis.com/auth/calendar',
					])
				},
			},
			duration: 15000,
		})

		setTimeout(() => {
			this.hasShownAuthError = false
		}, 60000)
	}

	private async getProviderToken(): Promise<string | null> {
		try {
			const session = await account.getSession('current')
			if (session.provider === 'google' && session.providerAccessToken) {
				const expiryDate = new Date(session.providerAccessTokenExpiry)
				if (expiryDate < new Date()) {
					this.showAuthError()
					return null
				}
				return session.providerAccessToken
			}
			return null
		} catch (error) {
			console.error('Failed to get session token for Google Calendar', error)
			return null
		}
	}

	private mapColorToId(hexColor?: string): string | undefined {
		if (!hexColor) return undefined
		const colorMap: Record<string, string> = {
			'#D79716': '5',
			'#D71616': '11',
			'#17720F': '10',
			'#1351AE': '9',
			'#97107A': '3',
			'#16ADD7': '7',
			'#4285F4': '9',
		}
		return colorMap[hexColor.toUpperCase()]
	}

	async fetchEvents(timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> {
		const token = await this.getProviderToken()
		if (!token) return []

		const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events`)
		url.searchParams.append('timeMin', timeMin.toISOString())
		url.searchParams.append('timeMax', timeMax.toISOString())
		url.searchParams.append('singleEvents', 'true')
		url.searchParams.append('maxResults', '500')

		try {
			const res = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				if (res.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar fetch error:', await res.text())
				return []
			}

			const data = await res.json()
			return data.items || []
		} catch (error) {
			console.error('Error fetching google calendar events:', error)
			return []
		}
	}

	async updateEvent(
		googleEventId: string,
		payload: { summary?: string; description?: string; color?: string; start: string; end: string }
	) {
		const token = await this.getProviderToken()
		if (!token) return

		const realId = googleEventId.replace('g_', '')
		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events/${realId}`

		const isAllDay = payload.start.length <= 10
		let startBody: GoogleDate, endBody: GoogleDate

		const formatIso = (iso: string) => {
			if (iso.includes('T') && (iso.endsWith('Z') || iso.includes('+'))) return iso
			if (iso.length === 16) return iso + ':00'
			return iso
		}

		if (isAllDay) {
			startBody = { date: payload.start }
			const endObj = new Date(payload.end)
			endObj.setDate(endObj.getDate() + 1)
			endBody = { date: endObj.toISOString().split('T')[0] }
		} else {
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
			const startIso = formatIso(payload.start)
			const endIso = formatIso(payload.end)

			startBody = { dateTime: startIso, timeZone }
			endBody = { dateTime: endIso, timeZone }
		}

		try {
			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					summary: payload.summary,
					description: payload.description,
					colorId: this.mapColorToId(payload.color),
					start: startBody,
					end: endBody,
				}),
			})

			if (!res.ok) {
				if (res.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar update error:', await res.text())
			}
		} catch (error) {
			console.error('Error updating google calendar event:', error)
		}
	}

	async deleteEvent(googleEventId: string) {
		const token = await this.getProviderToken()
		if (!token) return

		const realId = googleEventId.replace('g_', '')
		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events/${realId}`

		try {
			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				console.error('Google Calendar delete error:', await res.text())
			}
		} catch (error) {
			console.error('Error deleting google calendar event:', error)
		}
	}

	async createEvent(payload: { summary: string; description?: string; color?: string; start: string; end: string }) {
		const token = await this.getProviderToken()
		if (!token) return null

		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events`

		const isAllDay = payload.start.length <= 10
		let startBody: GoogleDate, endBody: GoogleDate

		const formatIso = (iso: string) => {
			if (iso.includes('T') && (iso.endsWith('Z') || iso.includes('+'))) return iso
			if (iso.length === 16) return iso + ':00'
			return iso
		}

		if (isAllDay) {
			startBody = { date: payload.start }
			const endObj = new Date(payload.end)
			endObj.setDate(endObj.getDate() + 1)
			endBody = { date: endObj.toISOString().split('T')[0] }
		} else {
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
			const startIso = formatIso(payload.start)
			const endIso = formatIso(payload.end)

			startBody = { dateTime: startIso }
			endBody = { dateTime: endIso }

			if (!startIso.endsWith('Z') && !startIso.includes('+')) {
				startBody.timeZone = timeZone
				endBody.timeZone = timeZone
			}
		}

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					summary: payload.summary,
					description: payload.description,
					colorId: this.mapColorToId(payload.color),
					start: startBody,
					end: endBody,
				}),
			})

			if (!res.ok) {
				console.error('Google Calendar create error:', await res.text())
				return null
			}
			return await res.json()
		} catch (error) {
			console.error('Error creating google calendar event:', error)
			return null
		}
	}
}

export const googleCalendarService = new GoogleCalendarService()
