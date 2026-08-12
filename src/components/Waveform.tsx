import { useState, useEffect, useRef } from "react";
import type { CircularBuffer } from "../utils/CircularBuffer";

interface Props {
	analyser: AnalyserNode | null;
	circularBuffer: React.RefObject<CircularBuffer | null>;
	windowDuration?: number;
}

export function Waveform({ analyser, circularBuffer, windowDuration }: Props) {
	const [canvasWidth, setCanvasWidth] = useState(1000);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) return;

		const observer = new ResizeObserver(entries => {
			const { width } = entries[0].contentRect;
			canvas.width = width;
			setCanvasWidth(width);
			canvas.height = 400;
		});

		observer.observe(canvas.parentElement!);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!analyser || !canvasRef.current || !windowDuration) return;

		const canvas = canvasRef.current;
		const canvasContext = canvas.getContext("2d", { willReadFrequently: true });

		const sampleRate = analyser.context.sampleRate;
		const pixelsPerSample = (canvas.width / (windowDuration * sampleRate));

		let animationId: number;

		const draw = () => {
			animationId = requestAnimationFrame(draw);

			if (!canvasContext || !circularBuffer.current) return;

			const numNewSamples: number = circularBuffer.current.getNumNewSamples();
			const wholePixelsToShift = Math.floor(numNewSamples * pixelsPerSample);

			// Wait to draw until we have enough new samples to move at least 1 pixel
			if (wholePixelsToShift < 1) return;

			const samplesToDraw = Math.floor(wholePixelsToShift / pixelsPerSample);

			const imageData = canvasContext.getImageData(
				wholePixelsToShift, 0,
				canvas.width - wholePixelsToShift, canvas.height
			);
			canvasContext.putImageData(imageData, 0, 0);

			canvasContext.clearRect(
				canvas.width - wholePixelsToShift, 0,
				wholePixelsToShift, canvas.height
			);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = `hsl(${getComputedStyle(canvas).getPropertyValue('--color-waveform')})`;
			canvasContext.beginPath();

			for (let i = 0; i < samplesToDraw; i++) {
				const x = (canvas.width - wholePixelsToShift) + (i * pixelsPerSample);
				const sample = circularBuffer.current?.read(1)[0] ?? 0;
				const y = (canvas.height / 2) - (sample * (canvas.height / 2));

				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}
			}

			canvasContext.stroke();
		};

		canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
		draw();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		}
	}, [analyser, canvasWidth, windowDuration]);

	return <canvas ref={canvasRef} width={1000} height={400} />;
}