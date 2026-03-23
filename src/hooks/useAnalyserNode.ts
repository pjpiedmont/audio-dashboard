import { useState, useRef } from "react";

export function useAnalyserNode(fftSize: number = 2048) {
	const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const contextRef = useRef<AudioContext | null>(null);
	const circularBuffer = useRef<Float32Array | null>(null);
	const writeHead = useRef(0);

	const startAnalyser = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const audioContext = new AudioContext();

			const bufferSize = audioContext.sampleRate * 30; // 30 seconds buffer
			circularBuffer.current = new Float32Array(bufferSize);

			await audioContext.audioWorklet.addModule('/audio-processor.js');

			const source = audioContext.createMediaStreamSource(stream);
			const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
			const analyserNode = audioContext.createAnalyser();
			analyserNode.fftSize = fftSize;

			source.connect(workletNode);
			source.connect(analyserNode);

			workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
				const samples = e.data;

				samples.forEach(sample => {
					if (circularBuffer.current) {
						circularBuffer.current[writeHead.current] = sample;
						writeHead.current++;
						writeHead.current = writeHead.current % bufferSize;
					}
				});
			};

			contextRef.current = audioContext;
			setAnalyser(analyserNode);
			setIsRunning(true);
		} catch (error) {
			console.error("Error accessing microphone:", error);
		}
	};

	const stopAnalyser = () => {
		if (!isRunning) return;

		if (contextRef.current) {
			contextRef.current.close();
			contextRef.current = null;
		}

		writeHead.current = 0;
		setAnalyser(null);
		setIsRunning(false);
	};

	const restartAnalyser = () => {
		stopAnalyser();
		startAnalyser();
	};

	return { analyser, isRunning, startAnalyser, stopAnalyser, restartAnalyser, circularBuffer, writeHead };
}