import { useState, useRef } from "react";

export function useAnalyserNode(fftSize: number = 2048) {
	const contextRef = useRef<AudioContext | null>(null);
	const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	const startAnalyser = async () => {
		if (isRunning) return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const audioContext = new AudioContext();
			const source = audioContext.createMediaStreamSource(stream);
			const analyserNode = audioContext.createAnalyser();

			analyserNode.fftSize = fftSize;
			source.connect(analyserNode);

			setAnalyser(analyserNode);
			contextRef.current = audioContext;
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

		setAnalyser(null);
		setIsRunning(false);
	};

	return { analyser, isRunning, startAnalyser, stopAnalyser };
}