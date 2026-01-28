const cleanHTML = (html: string) => html.replace(/>\s+</g, '><').trim()

export const JOURNAL_TEMPLATES = {
	emotional_checkin: {
		key: 'emotional_checkin',
		title: 'Emotional Check-In',
		icon: '🫀',
		content: cleanHTML(`
      <h3>How am I feeling right now?</h3>
      <ul>
        <li>Main emotion:</li>
        <li>Intensity (1–10):</li>
      </ul>

      <h3>What caused this feeling?</h3>
      <p></p>

      <h3>Where do I feel it in my body?</h3>
      <p></p>

      <h3>What do I need right now?</h3>
      <ul>
        <li></li>
        <li></li>
      </ul>
    `),
	},

	gratitude: {
		key: 'gratitude',
		title: 'Gratitude Journal',
		icon: '🙏',
		content: cleanHTML(`
      <h3>What am I grateful for today?</h3>
      <ol>
        <li></li>
        <li></li>
        <li></li>
      </ol>

      <h3>Why does this matter to me?</h3>
      <p></p>
    `),
	},

	mind_dump: {
		key: 'mind_dump',
		title: 'Mind Dump',
		icon: '🧠',
		content: cleanHTML(`
      <h3>Everything on my mind right now</h3>
      <p>Write freely. No structure, no filtering.</p>
      <p></p>
      <p></p>
      <p></p>
    `),
	},

	anxiety_journal: {
		key: 'anxiety_journal',
		title: 'Anxiety Journal',
		icon: '😰',
		content: cleanHTML(`
      <h3>What am I anxious about?</h3>
      <p></p>

      <h3>What is the worst-case scenario?</h3>
      <p></p>

      <h3>How likely is this actually?</h3>
      <p></p>

      <h3>What is in my control?</h3>
      <ul>
        <li></li>
        <li></li>
      </ul>

      <h3>One small step I can take</h3>
      <p></p>
    `),
	},

	success_journal: {
		key: 'success_journal',
		title: 'Success Journal',
		icon: '🏆',
		content: cleanHTML(`
      <h3>What did I do well today?</h3>
      <ul>
        <li></li>
        <li></li>
        <li></li>
      </ul>

      <h3>What challenge did I overcome?</h3>
      <p></p>

      <h3>What does this say about me?</h3>
      <p></p>
    `),
	},

	morning_planning: {
		key: 'morning_planning',
		title: 'Morning Planning',
		icon: '🌅',
		content: cleanHTML(`
      <h3>Top 3 priorities for today</h3>
      <ol>
        <li></li>
        <li></li>
        <li></li>
      </ol>

      <h3>One thing that will make today successful</h3>
      <p></p>

      <h3>Potential obstacles</h3>
      <ul>
        <li></li>
      </ul>
    `),
	},

	evening_reflection: {
		key: 'evening_reflection',
		title: 'Evening Reflection',
		icon: '🌙',
		content: cleanHTML(`
      <h3>What went well today?</h3>
      <ul>
        <li></li>
        <li></li>
      </ul>

      <h3>What didn’t go as planned?</h3>
      <p></p>

      <h3>What did I learn?</h3>
      <p></p>

      <h3>One thing I’ll improve tomorrow</h3>
      <p></p>
    `),
	},
} as const

export type TemplateKey = keyof typeof JOURNAL_TEMPLATES | 'empty'
