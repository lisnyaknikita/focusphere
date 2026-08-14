'use client'

import { useQuickIdeas } from '@/shared/hooks/use-quick-ideas/use-quick-ideas'
import { QuickIdea } from '@/shared/types/quick-idea'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { QuickIdeaItem } from '@/shared/ui/quick-idea-modal/quick-idea-item/quick-idea-item'
import { AnimatePresence, motion } from 'framer-motion'
import { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'sonner'
import classes from './quick-ideas-drawer.module.scss'

interface QuickIdeasDrawerProps {
	isOpen: boolean
	onClose: () => void
}

export const QuickIdeasDrawer = ({ isOpen, onClose }: QuickIdeasDrawerProps) => {
	const { ideas, isLoading, newIdeaText, setNewIdeaText, isSaving, handleAddIdea, handleEditIdea, handleDeleteIdea } =
		useQuickIdeas()

	const [searchQuery, setSearchQuery] = useState('')

	const filteredIdeas = useMemo(() => {
		if (!searchQuery.trim()) return ideas
		return ideas.filter(idea => idea.text.toLowerCase().includes(searchQuery.toLowerCase()))
	}, [ideas, searchQuery])

	const handleCreateInDrawer = async (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (!newIdeaText.trim() || isSaving) return

			try {
				await handleAddIdea()
				toast.success('Idea added!')
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message)
				} else {
					toast.error('Failed to add idea.')
				}
			}
		}
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className={classes.overlay}
					onClick={onClose}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						className={classes.drawer}
						onClick={e => e.stopPropagation()}
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
					>
						<div className={classes.header}>
							<div className={classes.titleGroup}>
								<h3>Quick Ideas</h3>
								<span className={classes.countBadge}>
									{isLoading ? <BeatLoader color='#aaa' size={2} className={classes.loader} /> : ideas.length}
								</span>
							</div>
							<button className={classes.closeBtn} onClick={onClose} aria-label='Close drawer' type='button'>
								<CloseIcon width={20} height={20} />
							</button>
						</div>

						<div className={classes.searchWrapper}>
							<input
								type='text'
								placeholder='Search ideas...'
								value={searchQuery}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
								className={classes.searchInput}
							/>
						</div>

						<div className={classes.createWrapper}>
							<input
								type='text'
								placeholder='Add a new idea... (Press Enter)'
								value={newIdeaText}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setNewIdeaText(e.target.value)}
								onKeyDown={handleCreateInDrawer}
								disabled={isSaving}
								className={classes.createInput}
								autoFocus
							/>
						</div>

						<div className={classes.list}>
							{isLoading ? (
								<BeatLoader color='#aaa' size={10} className={classes.loader} />
							) : filteredIdeas.length === 0 ? (
								<div className={classes.stateText}>
									{searchQuery ? 'No ideas match your search.' : 'Inbox is empty! 🎉'}
								</div>
							) : (
								filteredIdeas.map((idea: QuickIdea) => (
									<QuickIdeaItem key={idea.$id} idea={idea} onEdit={handleEditIdea} onDelete={handleDeleteIdea} />
								))
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
