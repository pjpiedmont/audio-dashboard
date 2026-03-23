import { useState } from "react";

import { Oscilloscope } from "./components/Oscilloscope";
import { Panel } from "./components/Panel";
import { SpectrumAnalyzer } from "./components/SpectrumAnalyzer";
import { Waveform } from "./components/Waveform";
import { useAnalyserNode } from "./hooks/useAnalyserNode";

import { Play, Square } from 'lucide-react';

function App() {
	const [windowDuration, setWindowDuration] = useState(10);
	const [fftSize, setFftSize] = useState(4096);
	const [xScale, setXScale] = useState<'linear' | 'decades' | 'octaves'>('octaves');
	const {
		analyser,
		isRunning,
		startAnalyser,
		stopAnalyser,
		circularBuffer,
		writeHead
	} = useAnalyserNode();

	const handleFftChange = async (newSize: number) => {
		setFftSize(newSize)
		if (isRunning) {
			await stopAnalyser()
			await startAnalyser(newSize)
		}
	}

	return (
		<div className="container">
			<h1>Audio Analyzer</h1>

			<div className="transport-controls">
				<button
					className={isRunning ? "transport-control running" : "transport-control"}
					onClick={isRunning ? stopAnalyser : () => startAnalyser(fftSize)}
					title={isRunning ? "Stop Audio Engine" : "Start Audio Engine"}
					aria-label={isRunning ? "Stop Audio Engine" : "Start Audio Engine"}
				>
					{isRunning ? <Square size={20} /> : <Play size={20} />}
				</button>
			</div>

			<div className="dashboard">
				<div className="width-full">
					<Panel
						label="Waveform"
						color="--color-waveform"
						controls={
							<label className="control">
								<span>Window</span>
								<input
									type="number"
									min={1}
									max={30}
									value={windowDuration}
									onChange={e => setWindowDuration(Number(e.target.value))}
								/>
								<span>s</span>
							</label>
						}
					>
						<Waveform
							analyser={analyser}
							circularBuffer={circularBuffer}
							writeHead={writeHead}
							windowDuration={windowDuration}
						/>
					</Panel>
				</div>

				<div className="width-half">
					<Panel label="Oscilloscope" color="--color-oscilloscope">
						<Oscilloscope analyser={analyser} />
					</Panel>
				</div>

				<div className="width-half">
					<Panel
						label="Spectrum Analyzer"
						color="--color-spectrum-high"
						controls={
							<>
								<label className="control">
									<span>FFT Size</span>
									<select
										value={fftSize}
										onChange={e => handleFftChange(Number(e.target.value))}
									>
										<option value={512}>512</option>
										<option value={1024}>1024</option>
										<option value={2048}>2048</option>
										<option value={4096}>4096</option>
										<option value={8192}>8192</option>
										<option value={16384}>16384</option>
										<option value={32768}>32768</option>
									</select>
								</label>
								<label className="control">
									<span>X Scale</span>
									<select
										value={xScale}
										onChange={e => setXScale(e.target.value as 'linear' | 'decades' | 'octaves')}
									>
										<option value="linear">Linear</option>
										<option value="decades">Decades</option>
										<option value="octaves">Octaves</option>
									</select>
								</label>
							</>
						}
					>
						<SpectrumAnalyzer analyser={analyser} xScale={xScale} />
					</Panel>
				</div>
			</div>
		</div>
	)
}

export default App;
