import { useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode;
	circularBuffer: React.RefObject<Float32Array | null>;
	writeHead: React.RefObject<number>;
}

export function Waveform({ analyser, circularBuffer, writeHead }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const readHead = useRef(0);

	useEffect(() => {
		if (!analyser || !canvasRef.current) return;

		readHead.current = writeHead.current;

		const canvas = canvasRef.current;
		const canvasContext = canvas.getContext("2d", { willReadFrequently: true });

		const sampleRate = analyser.context.sampleRate;
		const windowDuration = 10; // seconds
		const pixelsPerSample = (canvas.width / (windowDuration * sampleRate));

		let animationId: number;

		const draw = () => {
			animationId = requestAnimationFrame(draw);

			if (!canvasContext || !circularBuffer.current) return;

			let numNewSamples: number;

			if (writeHead.current < readHead.current) {
				numNewSamples = (writeHead.current + circularBuffer.current!.length) - readHead.current;
			} else {
				numNewSamples = writeHead.current - readHead.current;
			}

			const wholePixelsToShift = Math.floor(numNewSamples * pixelsPerSample);

			// Wait to draw until we have enough new samples to move at least 1 pixel
			if (wholePixelsToShift < 1) return;

			const samplesToDraw = Math.floor(wholePixelsToShift / pixelsPerSample);

			const imageData = canvasContext.getImageData(
				wholePixelsToShift, 0,
				canvas.width - wholePixelsToShift, canvas.height
			);
			canvasContext.putImageData(imageData, 0, 0);

			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(
				canvas.width - wholePixelsToShift, 0,
				wholePixelsToShift, canvas.height
			);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = `hsl(${getComputedStyle(canvas).getPropertyValue('--color-waveform')})`;
			canvasContext.beginPath();

			for (let i = 0; i < samplesToDraw; i++) {
				const x = (canvas.width - wholePixelsToShift) + (i * pixelsPerSample);
				const sample = circularBuffer.current[readHead.current];
				const y = (canvas.height / 2) - (sample * (canvas.height / 2));

				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}

				readHead.current = (readHead.current + 1) % circularBuffer.current.length;
			}

			canvasContext.stroke();
		};

		if (canvasContext) {
			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(0, 0, canvas.width, canvas.height);
		}

		draw();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		}
	}, [analyser]);

	return <canvas ref={canvasRef} width={1000} height={500} />;
}