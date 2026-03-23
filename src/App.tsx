import { useState } from "react";
import { Oscilloscope } from "./components/Oscilloscope";
import { Panel } from "./components/Panel";
import { SpectrumAnalyzer } from "./components/SpectrumAnalyzer";
import { Waveform } from "./components/Waveform";
import { useAnalyserNode } from "./hooks/useAnalyserNode";

function App() {
	const [windowDuration, setWindowDuration] = useState(10);
	const [fftSize, setFftSize] = useState(4096);
	const {
		analyser,
		isRunning,
		startAnalyser,
		stopAnalyser,
		restartAnalyser,
		circularBuffer,
		writeHead
	} = useAnalyserNode();

	const handleFftChange = async (newSize: number) => {
		setFftSize(newSize)
		if (isRunning) {
			await restartAnalyser(newSize)
		}
	}

	return (
		<div className="container">
			<h1>Audio Analyzer</h1>

			<select
				value={fftSize}
				onChange={e => handleFftChange(Number(e.target.value))}
			>
				<option value={512}>512</option>
				<option value={1024}>1024</option>
				<option value={2048}>2048</option>
				<option value={4096}>4096</option>
				<option value={8192}>8192</option>
			</select>

			<button onClick={() => startAnalyser(fftSize)} disabled={isRunning}>
				Start Analyser
			</button>
			<button onClick={stopAnalyser} disabled={!isRunning}>
				Stop Analyser
			</button>
			<button onClick={() => restartAnalyser(fftSize)} disabled={!isRunning}>
				Restart Analyser
			</button>

			{analyser && <p>Analyser is running with FFT size: {analyser.fftSize}</p>}
			{!analyser && <p>Analyser is not running.</p>}

			<div className="dashboard">
				<div className="width-full">
					<Panel label="Waveform" color="--color-waveform">
						<Waveform
							analyser={analyser}
							circularBuffer={circularBuffer}
							writeHead={writeHead}
						/>
					</Panel>
				</div>

				<div className="width-half">
					<Panel label="Oscilloscope" color="--color-oscilloscope">
						<Oscilloscope analyser={analyser} />
					</Panel>
				</div>

				<div className="width-half">
					<Panel label="Spectrum Analyzer" color="--color-spectrum-high">
						<SpectrumAnalyzer analyser={analyser} />
					</Panel>
				</div>
			</div>
		</div>
		// </div>
	)
}

export default App;
