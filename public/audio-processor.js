class AudioProcessor extends AudioWorkletProcessor {
	process(inputs, outputs, parameters) {
		const input = inputs[0][0]; // Treat input as mono

		if (input) {
			this.port.postMessage(input);
		}

		return true;
	}
}

registerProcessor('audio-processor', AudioProcessor);