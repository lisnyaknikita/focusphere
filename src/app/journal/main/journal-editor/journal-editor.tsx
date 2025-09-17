'use client'

import { useTinyMCEStyles } from '@/shared/hooks/editor/useTinyMCEStyles'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(m => m.Editor), {
	ssr: false,
})

export const JournalEditor = () => {
	const { contentStyle, editorKey } = useTinyMCEStyles()

	return (
		<>
			<Editor
				key={editorKey}
				apiKey='0y4iqb3uenz1ir049bfxyaoqi9c2g6pvtc8da5ur5bvvxz3p'
				init={{
					height: '100%',
					resize: false,
					menubar: false,
					plugins: [
						'advlist',
						'autolink',
						'lists',
						'link',
						'charmap',
						'preview',
						'anchor',
						'searchreplace',
						'visualblocks',
						'code',
						'fullscreen',
						'insertdatetime',
						'media',
						'table',
						'help',
						'wordcount',
						'emoticons',
						'codesample',
					],
					toolbar: `
						undo redo | blocks | bold italic underline strikethrough |
						alignleft aligncenter alignright alignjustify |
						bullist numlist checklist outdent indent | fullscreen
					`,
					advlist_bullet_styles: 'disc',
					advlist_number_styles: 'decimal',
					toolbar_mode: 'sliding',
					content_style: contentStyle,
				}}
				initialValue='Start writing your journal entry...'
			/>
		</>
	)
}
