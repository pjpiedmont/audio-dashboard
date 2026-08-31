export class CircularBuffer {
	public readonly buffer: Float32Array;
	public readHead: number;
	public writeHead: number;
	public readonly size: number;
	public numNewSamples: number;

	constructor(size: number) {
		this.size = size;
		this.buffer = new Float32Array(size);
		this.readHead = 0;
		this.writeHead = 0;
		this.numNewSamples = 0;
	}

	public write(samples: Float32Array): void {
		samples.forEach(sample => {
			this.buffer[this.writeHead] = sample;
			this.writeHead++;
			this.writeHead = this.writeHead % this.size;

			if (this.numNewSamples < this.size) {
				this.numNewSamples++;
			} else {
				// advance read head if buffer is full
				this.readHead++;
				this.readHead = this.readHead % this.size;
			}
		});
	}

	public read(count: number): Float32Array {
		const numNewSamples = this.getNumNewSamples();

		if (count > numNewSamples) {
			count = numNewSamples;
		}

		const output = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			output[i] = this.buffer[this.readHead];
			this.readHead++;
			this.readHead = this.readHead % this.size;
			this.numNewSamples--;
		}

		return output;
	}

	public getNumNewSamples(): number {
		return this.numNewSamples;
	}

	public clear(): void {
		this.buffer.fill(0);
		this.readHead = 0;
		this.writeHead = 0;
		this.numNewSamples = 0;
	}
}