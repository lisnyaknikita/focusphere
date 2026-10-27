import { account } from '@/lib/appwrite'
import { addDaysToDateString, getUserTimeZone } from '@/shared/utils/event-date-time/event-date-time'
import { OAuthProvider } from 'appwrite'
import { toast } from 'sonner'
import 'temporal-polyfill/global'
import { APP_URL } from '../constants/app'

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
	private cachedToken: string | null = null
	private tokenExpiry: Date | null = null

	private formatIso(iso: string): string {
		if (iso.includes('T') && (iso.endsWith('Z') || iso.includes('+'))) return iso
		if (iso.length === 16) return iso + ':00'
		return iso
	}

	private showAuthError() {
		if (this.hasShownAuthError) return
		this.hasShownAuthError = true

		toast.error('Google Calendar connection expired', {
			description: 'Please reconnect your Google account to sync events.',
			action: {
				label: 'Reconnect',
				onClick: () => {
					account.createOAuth2Session(OAuthProvider.Google, `${APP_URL}/dashboard`, `${APP_URL}/login`, [
						'https://www.googleapis.com/auth/calendar',
					])
				},
			},
			duration: 5000,
		})

		setTimeout(() => {
			this.hasShownAuthError = false
		}, 60000)
	}

	private async getProviderToken(): Promise<string | null> {
		if (this.cachedToken && this.tokenExpiry && this.tokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
			return this.cachedToken
		}

		try {
			const session = await account.getSession('current')
			if (session.provider !== 'google') return null

			const expiryDate = new Date(session.providerAccessTokenExpiry)
			const isExpired = expiryDate < new Date()

			if (isExpired) {
				const newToken = await this.refreshProviderToken(session.userId)
				if (newToken) {
					this.cachedToken = newToken
					this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)
					return newToken
				}

				this.showAuthError()
				return null
			}

			this.cachedToken = session.providerAccessToken
			this.tokenExpiry = expiryDate
			return this.cachedToken
		} catch (error) {
			console.error('Failed to get session token for Google Calendar', error)
			return null
		}
	}

	private async refreshProviderToken(userId: string): Promise<string | null> {
		try {
			const { Functions } = await import('appwrite')
			const { client } = await import('@/lib/appwrite')

			const functions = new Functions(client)
			const execution = await functions.createExecution(
				process.env.NEXT_PUBLIC_FUNCTION_ID!,
				JSON.stringify({ userId }),
				false
			)

			const result = JSON.parse(execution.responseBody)
			return result.accessToken ?? null
		} catch (err) {
			console.error('refreshProviderToken error:', err)
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

	async fetchEvents(timeMinIso: string, timeMaxIso: string): Promise<GoogleCalendarEvent[]> {
		const token = await this.getProviderToken()
		if (!token) return []

		const formattedMin = new Date(timeMinIso).toISOString()
		const formattedMax = new Date(timeMaxIso).toISOString()

		const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events`)
		url.searchParams.append('timeMin', formattedMin)
		url.searchParams.append('timeMax', formattedMax)
		url.searchParams.append('singleEvents', 'true')
		url.searchParams.append('maxResults', '500')
		url.searchParams.append('fields', 'items(id,summary,description,colorId,start,end)')

		try {
			const res = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				if (res.status === 401) {
					this.showAuthError()
				} else {
					toast.error('Failed to sync Google Calendar events')
				}
				console.error('Google Calendar fetch error:', await res.text())
				return []
			}

			const data = await res.json()
			return data.items || []
		} catch (error) {
			console.error('Error fetching google calendar events:', error)
			toast.error('Network error. Google Calendar sync failed.')
			return []
		}
	}

	async updateEvent(
		googleEventId: string,
		payload: { summary?: string; description?: string; color?: string; start?: string; end?: string }
	) {
		const token = await this.getProviderToken()
		if (!token) return

		const realId = googleEventId.replace('g_', '')
		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events/${realId}`

		const requestBody: Record<string, unknown> = {}
		if (payload.summary !== undefined) requestBody.summary = payload.summary
		if (payload.description !== undefined) requestBody.description = payload.description
		if (payload.color !== undefined) requestBody.colorId = this.mapColorToId(payload.color)

		if (payload.start && payload.end) {
			const isAllDay = payload.start.length <= 10
			let startBody: GoogleDate, endBody: GoogleDate

			if (isAllDay) {
				startBody = { date: payload.start }
				endBody = { date: addDaysToDateString(payload.end, 1) }
			} else {
				const timeZone = getUserTimeZone()
				const startIso = this.formatIso(payload.start)
				const endIso = this.formatIso(payload.end)

				startBody = { dateTime: startIso, timeZone }
				endBody = { dateTime: endIso, timeZone }
			}
			requestBody.start = startBody
			requestBody.end = endBody
		}

		try {
			const res = await fetch(url, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
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
				if (res.status === 404 || res.status === 410) {
					return
				}

				if (res.status === 401) {
					this.showAuthError()
					return
				}

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

		if (isAllDay) {
			startBody = { date: payload.start }
			endBody = { date: addDaysToDateString(payload.end, 1) }
		} else {
			const timeZone = getUserTimeZone()
			const startIso = this.formatIso(payload.start)
			const endIso = this.formatIso(payload.end)

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

	async createRecurringEvent(payload: {
		summary: string
		description?: string
		color?: string
		start: string
		end: string
		recurrenceRule: string
	}) {
		const token = await this.getProviderToken()
		if (!token) return null

		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events`

		const isAllDay = payload.start.length <= 10
		let startBody: GoogleDate, endBody: GoogleDate

		if (isAllDay) {
			startBody = { date: payload.start }
			endBody = { date: addDaysToDateString(payload.end, 1) }
		} else {
			const timeZone = getUserTimeZone()
			const startIso = this.formatIso(payload.start)
			const endIso = this.formatIso(payload.end)

			startBody = { dateTime: startIso, timeZone }
			endBody = { dateTime: endIso, timeZone }
		}

		const rrule = payload.recurrenceRule.startsWith('RRULE:')
			? payload.recurrenceRule
			: `RRULE:${payload.recurrenceRule}`

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
					recurrence: [rrule],
				}),
			})

			if (!res.ok) {
				if (res.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar create recurring error:', await res.text())
				return null
			}
			return await res.json()
		} catch (error) {
			console.error('Error creating google calendar recurring event:', error)
			return null
		}
	}

	async updateRecurringEvent(
		googleEventId: string,
		payload: {
			summary?: string
			description?: string
			color?: string
			start?: string
			end?: string
			recurrenceRule?: string
		}
	) {
		const token = await this.getProviderToken()
		if (!token) return

		const realId = googleEventId.replace('g_', '')
		const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events/${realId}`

		const requestBody: Record<string, unknown> = {}
		if (payload.summary !== undefined) requestBody.summary = payload.summary
		if (payload.description !== undefined) requestBody.description = payload.description
		if (payload.color !== undefined) requestBody.colorId = this.mapColorToId(payload.color)

		if (payload.start && payload.end) {
			const isAllDay = payload.start.length <= 10
			let startBody: GoogleDate, endBody: GoogleDate

			if (isAllDay) {
				startBody = { date: payload.start }
				endBody = { date: addDaysToDateString(payload.end, 1) }
			} else {
				const timeZone = getUserTimeZone()
				const startIso = this.formatIso(payload.start)
				const endIso = this.formatIso(payload.end)

				startBody = { dateTime: startIso, timeZone }
				endBody = { dateTime: endIso, timeZone }
			}
			requestBody.start = startBody
			requestBody.end = endBody
		}

		if (payload.recurrenceRule !== undefined) {
			const rrule = payload.recurrenceRule.startsWith('RRULE:')
				? payload.recurrenceRule
				: `RRULE:${payload.recurrenceRule}`
			requestBody.recurrence = [rrule]
		}

		try {
			const res = await fetch(url, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})

			if (!res.ok) {
				if (res.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar update recurring error:', await res.text())
			}
		} catch (error) {
			console.error('Error updating google calendar recurring event:', error)
		}
	}

	async deleteEventInstance(googleEventId: string, instanceDate: string) {
		const token = await this.getProviderToken()
		if (!token) return

		const realMasterId = googleEventId.replace('g_', '')

		const timeZone = getUserTimeZone()
		const plainDate = Temporal.PlainDate.from(instanceDate)
		const timeMin = plainDate.subtract({ days: 1 }).toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
		const timeMax = plainDate.add({ days: 2 }).toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()

		const instancesUrl = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${realMasterId}/instances`)
		instancesUrl.searchParams.append('timeMin', timeMin)
		instancesUrl.searchParams.append('timeMax', timeMax)

		try {
			const listRes = await fetch(instancesUrl.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!listRes.ok) {
				if (listRes.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar list instances error:', await listRes.text())
				return
			}

			const listData = await listRes.json()
			const instances: Array<{ id: string; start?: { date?: string; dateTime?: string } }> = listData.items || []

			const targetInstance =
				instances.find(inst => {
					const instDate = inst.start?.date || inst.start?.dateTime?.slice(0, 10)
					if (instDate === instanceDate) return true
					if (inst.start?.dateTime) {
						try {
							const zdt = Temporal.Instant.from(inst.start.dateTime).toZonedDateTimeISO(timeZone)
							return zdt.toPlainDate().toString() === instanceDate
						} catch {
							return false
						}
					}
					return false
				}) || instances[0]

			if (!targetInstance?.id) {
				console.warn(`No Google Calendar instance found for master ${realMasterId} on date ${instanceDate}`)
				return
			}

			const deleteRes = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${targetInstance.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!deleteRes.ok && deleteRes.status !== 404 && deleteRes.status !== 410) {
				if (deleteRes.status === 401) {
					this.showAuthError()
				}
				console.error('Google Calendar delete instance error:', await deleteRes.text())
			}
		} catch (error) {
			console.error('Error deleting google calendar event instance:', error)
		}
	}
}

export const googleCalendarService = new GoogleCalendarService()
