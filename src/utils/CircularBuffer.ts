export class CircularBuffer {
	public readonly buffer: Float32Array;
	public readHead: number;
	public writeHead: number;
	public readonly size: number;

	constructor(size: number) {
		this.size = size;
		this.buffer = new Float32Array(size);
		this.readHead = 0;
		this.writeHead = 0;
	}

	public write(samples: Float32Array): void {
		samples.forEach(sample => {
			this.buffer[this.writeHead] = sample;
			this.writeHead++;
			this.writeHead = this.writeHead % this.size;
		});
	}

	public read(count: number): Float32Array {
		const output = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			output[i] = this.buffer[this.readHead];
			this.readHead++;
			this.readHead = this.readHead % this.size;
		}

		return output;
	}

	public getNumNewSamples(): number {
		if (this.writeHead < this.readHead) {
			return (this.writeHead + this.size) - this.readHead;
		} else {
			return this.writeHead - this.readHead;
		}
	}

	public clear(): void {
		this.readHead = 0;
		this.writeHead = 0;
	}
}