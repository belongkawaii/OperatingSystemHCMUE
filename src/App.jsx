import { useState } from "react";
import "./App.css";

import Control from "./components/Control";
import ProcessTable from "./components/ProcessTable";
import GanttChart from "./components/GanttChart";
import Statistics from "./components/Statistics";
import ProcessInformation from "./components/ProcessInformation";

import useSimulator from "./hooks/useSimulator";

function App() {
  const [algorithm, setAlgorithm] =
    useState("FCFS");

  const [quantum, setQuantum] =
    useState(2);

  const [locked, setLocked] =
    useState(false);

  const [processes, setProcesses] =
    useState([
      {
        id: 1,
        arrivalTime: 0,
        burstTime: 8,
        ioStartTime: 3,
        ioTime: 2,
      },
      {
        id: 2,
        arrivalTime: 1,
        burstTime: 6,
        ioStartTime: 2,
        ioTime: 2,
      },
    ]);

  const {
    snapshots,

    running,
    finished,

    speed,
    setSpeed,

    setRunning,

    initializeSimulation,

    nextStep,

    resetSimulation,
  } = useSimulator();

  const handleInitialize = () => {

    initializeSimulation(
      algorithm,
      quantum,
      processes
    );

    setLocked(true);
  };

  const handleReset = () => {

    resetSimulation();

    setLocked(false);
  };

  return (
    <div className="app-container">

      <header className="top-header">

        <div>

          <h1>
            CPU Scheduling Simulator
          </h1>

          <p>
            FCFS & RR with I/O
          </p>

        </div>

        <div className="header-badge">
          Operating Systems
        </div>

      </header>

      <main className="dashboard">

        {/* LEFT TOP */}

        <section className="control-panel">

          <Control
            running={running}
            finished={finished}
            speed={speed}
            setSpeed={setSpeed}
            setRunning={setRunning}
            nextStep={nextStep}
            initialize={handleInitialize}
            resetSimulation={handleReset}
          />

        </section>

        {/* RIGHT TOP */}

        <section className="gantt-panel">

          <GanttChart
            snapshots={snapshots}
          />

        </section>

        {/* LEFT BOTTOM */}

        <section className="process-panel">

          <ProcessTable
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}

            quantum={quantum}
            setQuantum={setQuantum}

            processes={processes}
            setProcesses={setProcesses}

            snapshots={snapshots}

            locked={locked}
          />

        </section>

        {/* RIGHT BOTTOM */}

        <section className="stats-panel">

        <Statistics
          snapshots={snapshots}
        />

        <ProcessInformation
          snapshots={snapshots}
        />

      </section>

      </main>

    </div>
  );
}

export default App;