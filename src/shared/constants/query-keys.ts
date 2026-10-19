export const calendarKeys = {
	all: ['calendar'] as const,
	localMonths: () => [...calendarKeys.all, 'local-month'] as const,
	localMonth: (userId: string, monthKey: string) => [...calendarKeys.localMonths(), userId, monthKey] as const,
	googleMonths: () => [...calendarKeys.all, 'google-month'] as const,
	googleMonth: (userId: string, monthKey: string) => [...calendarKeys.googleMonths(), userId, monthKey] as const,
	recurring: (userId: string) => [...calendarKeys.all, 'recurring', userId] as const,
}
