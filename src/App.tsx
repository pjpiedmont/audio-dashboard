import { useState } from "react";
import { Oscilloscope } from "./components/Oscilloscope";
import { Panel } from "./components/Panel";
import { SpectrumAnalyzer } from "./components/SpectrumAnalyzer";
import { Waveform } from "./components/Waveform";
import { useAnalyserNode } from "./hooks/useAnalyserNode";

function App() {
	const [windowDuration, setWindowDuration] = useState(10);
	const {
		analyser,
		isRunning,
		startAnalyser,
		stopAnalyser,
		restartAnalyser,
		circularBuffer,
		writeHead
	} = useAnalyserNode(4096);

	return (
		<div className="container">
			<h1>Audio Analyzer</h1>

			<button onClick={startAnalyser} disabled={isRunning}>
				Start Analyser
			</button>
			<button onClick={stopAnalyser} disabled={!isRunning}>
				Stop Analyser
			</button>
			<button onClick={restartAnalyser} disabled={!isRunning}>
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
