import { useEffect, useRef } from "react";

interface Props {
	analyser: AnalyserNode;
}

export function Waveform({ analyser }: Props) {
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

			const imageData = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
			canvasContext.putImageData(imageData, 0, 0);

			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(canvas.width - 1, 0, 1, canvas.height);

			const x = canvas.width - 1;

			let peak = 127
			dataArray.forEach(v => {
				if (Math.abs(v - 127) > Math.abs(peak - 127)) peak = v
			});

			const y = canvas.height - (peak / 256) * canvas.height;

			canvasContext.beginPath();
			canvasContext.moveTo(x - 1, canvas.height / 2);
			canvasContext.lineTo(x, y);
			canvasContext.stroke();
		};

		if (canvasContext) {
			canvasContext.fillStyle = "rgb(0, 0, 0)";
			canvasContext.fillRect(0, 0, canvas.width, canvas.height);

			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = "rgb(255, 255, 255)";
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