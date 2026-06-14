import ProcessTable from './components/ProcessTable';
import Algorithm from './components/Algorithm';
import Control from './components/Control';
import GanttChart from './components/GanttChart';
import useSimulator from './hooks/useSimulator';

function App() {
  const sim = useSimulator();

  return (
    <div className="app-container">
      <main className="main-content">
        <div className="left-pane">
          <ProcessTable
            processes={sim.processes}
            addProcess={sim.addProcess}
            deleteProcess={sim.deleteProcess}
            updateProcess={sim.updateProcess}
            disabled={sim.hasStarted && !sim.finished}
          />
          <Algorithm
            algorithm={sim.algorithm}
            setAlgorithm={sim.setAlgorithm}
            quantum={sim.quantum}
            setQuantum={sim.setQuantum}
            disabled={sim.hasStarted && !sim.finished}
          />
          <Control
            start={sim.start}
            pause={sim.pause}
            reset={sim.reset}
            skipStep={sim.skipStep}
            stepMode={sim.stepMode}
            setStepMode={sim.setStepMode}
            canStart={sim.canStart}
            canPause={sim.canPause}
            canSkip={sim.canSkip}
            running={sim.running}
            finished={sim.finished}
            progress={sim.progress}
            hasStarted={sim.hasStarted}
          />
        </div>
        <div className="right-pane">
          <GanttChart 
            snapshots={sim.snapshots}
            blocks={sim.blocks}
            currentStep={sim.currentStep}
            finished={sim.finished}
            processes={sim.processes}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
