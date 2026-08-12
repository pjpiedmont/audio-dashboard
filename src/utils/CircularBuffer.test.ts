import { describe, it, expect } from "vitest";
import { CircularBuffer } from "./CircularBuffer";

describe("CircularBuffer", () => {
	it("should initialize with zeros and heads at 0", () => {
		const buf = new CircularBuffer(3);
		expect(Array.from(buf.buffer)).toEqual([0, 0, 0]);
		expect(buf.readHead).toBe(0);
		expect(buf.writeHead).toBe(0);
	});

	it("should write samples and update writeHead in-place", () => {
		const buf = new CircularBuffer(5);
		buf.write(new Float32Array([1.5, -0.5]));

		expect(Array.from(buf.buffer)).toEqual([1.5, -0.5, 0, 0, 0]);
		expect(buf.writeHead).toBe(2);
		expect(buf.readHead).toBe(0);
	});

	it("should wrap around on overflow when writing", () => {
		const buf = new CircularBuffer(3);
		buf.write(new Float32Array([1, 2, 3, 4]));

		expect(Array.from(buf.buffer)).toEqual([4, 2, 3]);
		expect(buf.writeHead).toBe(1);
	});

	it("should read samples correctly and advance readHead", () => {
		const buf = new CircularBuffer(5);
		buf.write(new Float32Array([1.5, -0.5, 3.0]));

		const readData = buf.read(2);
		expect(Array.from(readData)).toEqual([1.5, -0.5]);
		expect(buf.readHead).toBe(2);
	});

	it("should wrap around on overflow when reading", () => {
		const buf = new CircularBuffer(3);
		buf.write(new Float32Array([1, 2, 3]));

		// advance read head
		buf.read(2);

		// write another value wrapping around
		buf.write(new Float32Array([4])); // buffer is [4, 2, 3]

		const readData = buf.read(2); // reads index 2 (value 3), then wraps to index 0 (value 4)
		expect(Array.from(readData)).toEqual([3, 4]);
		expect(buf.readHead).toBe(1);
	});

	it("should stop reading when it hits the write head", () => {
		const buf = new CircularBuffer(5);
		buf.write(new Float32Array([1, 2, 3, 4]));
		buf.read(2);

		const readData = buf.read(5); // should only read two elements
		expect(Array.from(readData)).toEqual([3, 4]);
		expect(buf.readHead).toBe(4);
	});

	it("should calculate correct number of new samples using getNumNewSamples", () => {
		const buf = new CircularBuffer(5);
		buf.write(new Float32Array([10, 20, 30]));
		expect(buf.getNumNewSamples()).toBe(3);

		buf.read(1);
		expect(buf.getNumNewSamples()).toBe(2);

		// wrap write head to beginning of buffer without overflowing read head
		buf.write(new Float32Array([40, 50]));
		expect(buf.getNumNewSamples()).toBe(4);
	});

	it("should clear correctly", () => {
		const buf = new CircularBuffer(3);
		buf.write(new Float32Array([1, 2]));
		buf.read(1);
		buf.clear();

		expect(Array.from(buf.buffer)).toEqual([0, 0, 0]);
		expect(buf.readHead).toBe(0);
		expect(buf.writeHead).toBe(0);
	});
});
