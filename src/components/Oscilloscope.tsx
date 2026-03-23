import { useState, useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode;
}

export function Oscilloscope({ analyser }: Props) {
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

		const draw = () => {
			animationId = requestAnimationFrame(draw);
			analyser.getByteTimeDomainData(dataArray);

			if (!canvasContext) return;

			// canvasContext.fillStyle = 'rgba(0, 0, 0, 0)';
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = `hsl(${getComputedStyle(canvas).getPropertyValue('--color-oscilloscope')})`;

			canvasContext.beginPath();

			const points = Array.from(dataArray).map((value, i) => {
				const x = (i / bufferLength) * canvas.width;
				const y = canvas.height - (value / 256) * canvas.height;
				return { x, y };
			});

			points.forEach(({ x, y }, i) => {
				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}
			});

			// canvasContext.lineTo(canvas.width, canvas.height);
			canvasContext.stroke();
		};

		draw();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		}
	}, [analyser, canvasWidth]);

	return <canvas ref={canvasRef} width={1000} height={500} />;
}