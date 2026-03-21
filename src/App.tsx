import { SpectrumAnalyzer } from "./components/SpectrumAnalyzer";
import { useAnalyserNode } from "./hooks/useAnalyserNode";

function App() {
	const { analyser, isRunning, startAnalyser, stopAnalyser } = useAnalyserNode();

	return (
		<div>
			<h1>Audio Analyzer</h1>

			<button onClick={isRunning ? stopAnalyser : startAnalyser}>
				{isRunning ? "Stop Analyser" : "Start Analyser"}
			</button>

			{analyser && <p>Analyser is running with FFT size: {analyser.fftSize}</p>}
			{!analyser && <p>Analyser is not running.</p>}

			{analyser && <SpectrumAnalyzer analyser={analyser} />}
		</div>
	)
}

export default App;
