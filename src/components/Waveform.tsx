import { useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode;
}

export function Waveform({ analyser }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!analyser || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const canvasContext = canvas.getContext("2d", { willReadFrequently: true });

		const sampleRate = analyser.context.sampleRate;
		const bufferLength = analyser.fftSize; // samples
		const bufferDuration = analyser.fftSize / sampleRate; // seconds
		const windowDuration = 5; // seconds
		const bufferWidth = (bufferDuration / windowDuration) * canvas.width; // pixels

		console.log("Sample Rate (Hz):", sampleRate);
		console.log("Buffer Length (samples):", bufferLength);
		console.log("Buffer Duration (s):", bufferDuration);
		console.log("Window Duration (s):", windowDuration);
		console.log("Buffer Width (px):", bufferWidth);

		const dataArray = new Uint8Array(bufferLength);

		let animationId: number;

		const draw = () => {
			animationId = requestAnimationFrame(draw);
			analyser.getByteTimeDomainData(dataArray);

			if (!canvasContext) return;

			const imageData = canvasContext.getImageData(
				bufferWidth, 0,
				canvas.width - bufferWidth, canvas.height
			);
			canvasContext.putImageData(imageData, 0, 0);

			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(
				canvas.width - bufferWidth, 0,
				bufferWidth, canvas.height
			);

			const points = Array.from(dataArray).map((value, i) => {
				const x = (canvas.width - bufferWidth) + (i / bufferLength) * bufferWidth;
				const y = canvas.height - (value / 256) * canvas.height;
				return { x, y };
			});

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = "rgb(255, 255, 255)";
			canvasContext.beginPath();

			points.forEach(({ x, y }, i) => {
				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}
			});

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