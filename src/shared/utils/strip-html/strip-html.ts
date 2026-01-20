export const stripHtml = (html: string) => {
	if (typeof window === 'undefined') return html
	const doc = new DOMParser().parseFromString(html, 'text/html')
	return doc.body.textContent || ''
}
