import styles from "./Panel.module.css"

interface Props {
	label: string
	children: React.ReactNode,
	color?: string
}

export function Panel({ label, children, color }: Props) {
	return (
		<>
			<span
				className={styles.label}
				style={{ color: `hsl(var(${color ?? '--color-text-primary'}))` }}
			>
				{label}
			</span >
			<div className={styles.panel}>
				{children}
			</div>
		</>
	)
}