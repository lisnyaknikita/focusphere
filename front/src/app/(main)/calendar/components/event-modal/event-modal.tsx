import { useState } from 'react'
import { ColorPicker } from './components/color-picker/color-picker'
import { DateTime } from './components/date-time/date-time'
import { Description } from './components/description/description'
import classes from './event-modal.module.scss'

interface EventModalProps {
	onClose: () => void
}

export const EventModal = ({ onClose }: EventModalProps) => {
	const [form, setForm] = useState({
		title: '',
		description: '',
		date: new Date(),
		startTime: '09:00',
		endTime: '10:00',
		color: '#3B82F6',
	})

	return (
		<div className={classes.modalInner}>
			<form className={classes.eventForm}>
				<input type='text' placeholder='Title...' className={classes.eventTitle} aria-label='Event title' />
				<DateTime />
				<Description />
				<ColorPicker />
				<button className={classes.saveButton}>Save</button>
			</form>
			<button className={classes.closeButton} onClick={() => onClose()}>
				<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<circle cx='10' cy='10' r='10' fill='#262525' />
					<path
						d='M15.8536 4.1464C15.7598 4.05266 15.6327 4 15.5001 4C15.3675 4 15.2404 4.05266 15.1466 4.1464L10 9.29299L4.85341 4.1464C4.75964 4.05266 4.63249 4 4.4999 4C4.36732 4 4.24016 4.05266 4.1464 4.1464C4.05266 4.24016 4 4.36732 4 4.4999C4 4.63249 4.05266 4.75964 4.1464 4.85341L9.29299 10L4.1464 15.1466C4.05266 15.2404 4 15.3675 4 15.5001C4 15.6327 4.05266 15.7598 4.1464 15.8536C4.24016 15.9473 4.36732 16 4.4999 16C4.63249 16 4.75964 15.9473 4.85341 15.8536L10 10.707L15.1466 15.8536C15.2404 15.9473 15.3675 16 15.5001 16C15.6327 16 15.7598 15.9473 15.8536 15.8536C15.9473 15.7598 16 15.6327 16 15.5001C16 15.3675 15.9473 15.2404 15.8536 15.1466L10.707 10L15.8536 4.85341C15.9473 4.75964 16 4.63249 16 4.4999C16 4.36732 15.9473 4.24016 15.8536 4.1464Z'
						fill='white'
					/>
				</svg>
			</button>
		</div>
	)
}
