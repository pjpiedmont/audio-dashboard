import styles from "./Panel.module.css"

interface Props {
	label: string
	children: React.ReactNode,
	color?: string,
	controls?: React.ReactNode
}

export function Panel({ label, children, color, controls }: Props) {
	return (
		<>
			<div className={styles.header}>
				<span
					className={styles.label}
					style={{ color: `hsl(var(${color ?? '--color-text-primary'}))` }}
				>
					{label}
				</span >
				{controls && <div className={styles.controls}>{controls}</div>}
			</div>
			<div className={styles.panel}>
				{children}
			</div>
		</>
	)
}