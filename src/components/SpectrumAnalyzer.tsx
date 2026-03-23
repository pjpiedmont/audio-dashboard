import { useState, useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode | null;
	xScale: 'linear' | 'decades' | 'octaves';
}

export function SpectrumAnalyzer({ analyser, xScale }: Props) {
	const [canvasWidth, setCanvasWidth] = useState(1000);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) return;

		const observer = new ResizeObserver(entries => {
			const { width } = entries[0].contentRect;
			canvas.width = width;
			setCanvasWidth(width);
			canvas.height = 500;
		});

		observer.observe(canvas.parentElement!);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!analyser || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const canvasContext = canvas.getContext("2d");
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		let animationId: number;

		const minHz = 20
		const maxHz = analyser.context.sampleRate / 2
		const hzPerBin = maxHz / analyser.frequencyBinCount
		// const totalOctaves = Math.log2(maxHz / minHz)

		const getX = (hz: number): number => {
			switch (xScale) {
				case 'decades':
					return (Math.log10(hz / minHz) / Math.log10(maxHz / minHz)) * canvas.width
				case 'octaves':
					return (Math.log2(hz / minHz) / Math.log2(maxHz / minHz)) * canvas.width
				default:
					return (hz / maxHz) * canvas.width
			}
		}

		const draw = () => {
			animationId = requestAnimationFrame(draw);
			analyser.getByteFrequencyData(dataArray);

			if (!canvasContext) return;

			canvasContext.clearRect(0, 0, canvas.width, canvas.height);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = "rgb(255, 255, 255)";
			canvasContext.strokeStyle = `hsl(${getComputedStyle(canvas).getPropertyValue('--color-spectrum-high')})`;

			canvasContext.beginPath();
			canvasContext.moveTo(0, canvas.height);

			const points = Array.from(dataArray).map((value, i) => {
				const hz = i * hzPerBin

				// const x = (Math.log2(hz / minHz) / totalOctaves) * canvas.width;
				const x = getX(hz);
				const y = canvas.height - (value / 255) * canvas.height;
				return { x, y };
			});

			points.forEach(({ x, y }, i) => {
				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}
			});

			canvasContext.lineTo(canvas.width, canvas.height);
			canvasContext.stroke();
		};

		canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
		draw();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		}
	}, [analyser, canvasWidth, xScale]);

	return <canvas ref={canvasRef} width={1000} height={500} />;
}