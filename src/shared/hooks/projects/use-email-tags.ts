import { useState } from 'react'

const generateEmail = (input: string) => {
	const cleaned = input.trim().toLowerCase()
	if (!cleaned) return ''
	if (cleaned.includes('@')) return cleaned
	return cleaned.replace(/\s+/g, '') + '@gmail.com'
}

export const useEmailTags = () => {
	const [name, setName] = useState('')
	const [members, setMembers] = useState<string[]>([])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			const email = generateEmail(name)

			if (email && email.includes('.') && !members.includes(email)) {
				setMembers(prev => [...prev, email])
				setName('')
			}
		}
	}

	const removeMember = (index: number) => {
		setMembers(prev => prev.filter((_, i) => i !== index))
	}

	const getFinalEmails = () => {
		const currentEmail = generateEmail(name)
		const finalEmails = [...members]

		if (currentEmail && !finalEmails.includes(currentEmail)) {
			finalEmails.push(currentEmail)
		}

		return finalEmails.map(m => m.trim()).filter(m => m.length > 0)
	}

	return {
		name,
		setName,
		members,
		handleKeyDown,
		removeMember,
		getFinalEmails,
		suggestionEmail: generateEmail(name),
	}
}
