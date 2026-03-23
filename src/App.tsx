import { Oscilloscope } from "./components/Oscilloscope";
import { Panel } from "./components/Panel";
import { SpectrumAnalyzer } from "./components/SpectrumAnalyzer";
import { Waveform } from "./components/Waveform";
import { useAnalyserNode } from "./hooks/useAnalyserNode";

function App() {
	const {
		analyser,
		isRunning,
		startAnalyser,
		stopAnalyser,
		circularBuffer,
		writeHead
	} = useAnalyserNode(4096);

	return (
		<div>
			<div className="container">
				<h1>Audio Analyzer</h1>

				<button onClick={isRunning ? stopAnalyser : startAnalyser}>
					{isRunning ? "Stop Analyser" : "Start Analyser"}
				</button>

				{analyser && <p>Analyser is running with FFT size: {analyser.fftSize}</p>}
				{!analyser && <p>Analyser is not running.</p>}

				{analyser && <div>
					<Panel
						label="Spectrum Analyzer"
						color="--color-spectrum-high"
					>
						<SpectrumAnalyzer analyser={analyser} />
					</Panel>

					<Panel label="Oscilloscope" color="--color-oscilloscope">
						<Oscilloscope analyser={analyser} />
					</Panel>

					<Panel label="Waveform" color="--color-waveform">
						<Waveform
							analyser={analyser}
							circularBuffer={circularBuffer}
							writeHead={writeHead}
						/>
					</Panel>
				</div>}
			</div>
		</div>
	)
}

export default App;
