import { useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode;
}

export function Oscilloscope({ analyser }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

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

			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(0, 0, canvas.width, canvas.height);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = "rgb(255, 255, 255)";

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
	}, [analyser]);

	return <canvas ref={canvasRef} width={1000} height={500} />;
}