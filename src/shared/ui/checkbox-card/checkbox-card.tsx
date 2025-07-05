'use client'

import { Checkbox, Text, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import classes from './checkbox-card.module.scss'

export function CheckboxCard() {
	const [value, onChange] = useState(true)

	return (
		<UnstyledButton onClick={() => onChange(!value)} className={classes.button}>
			<Checkbox
				checked={value}
				onChange={() => {}}
				tabIndex={-1}
				size='md'
				mr='xl'
				styles={{ input: { cursor: 'pointer' } }}
				aria-hidden
			/>

			<div>
				<Text fw={500} mb={7} lh={1}>
					Task 1
				</Text>
			</div>
		</UnstyledButton>
	)
}
