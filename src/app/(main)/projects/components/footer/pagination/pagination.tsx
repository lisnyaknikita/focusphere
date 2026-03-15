import clsx from 'clsx'
import classes from './pagination.module.scss'

interface PaginationProps {
	currentPage: number
	total: number
	limit: number
	onChange: (page: number) => void
}

export const Pagination = ({ currentPage, total, limit, onChange }: PaginationProps) => {
	const totalPages = Math.ceil(total / limit)
	console.log(currentPage, total, limit)

	return (
		<div className={classes.paginationButtons}>
			{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
				<button
					key={page}
					className={clsx(classes.button, currentPage === page && 'active')}
					onClick={() => onChange(page)}
				>
					{page}
				</button>
			))}
		</div>
	)
}
