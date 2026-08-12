import { useState, useRef } from "react";
import { CircularBuffer } from "../utils/CircularBuffer";

export function useAnalyserNode() {
	const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const contextRef = useRef<AudioContext | null>(null);
	const circularBuffer = useRef<CircularBuffer | null>(null);

	const startAnalyser = async (fftSize: number) => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const audioContext = new AudioContext();

			const bufferSize = audioContext.sampleRate * 30; // 30 seconds buffer
			circularBuffer.current = new CircularBuffer(bufferSize);

			await audioContext.audioWorklet.addModule('/audio-processor.js');

			const source = audioContext.createMediaStreamSource(stream);
			const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
			const analyserNode = audioContext.createAnalyser();
			analyserNode.fftSize = fftSize;

			source.connect(workletNode);
			source.connect(analyserNode);

			workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
				const samples = e.data;
				circularBuffer.current?.write(samples);
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

		circularBuffer.current?.clear();
		setAnalyser(null);
		setIsRunning(false);
	};

	return { analyser, isRunning, startAnalyser, stopAnalyser, circularBuffer };
}