import Image from 'next/image'

export default function Home() {
	return (
		<div>
			Home
			<Image src={'/logo-dark.svg'} alt='logo' width={336} height={46} />
		</div>
	)
}
