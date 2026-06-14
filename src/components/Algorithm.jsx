import { Settings, Check, X } from 'lucide-react';

export default function Algorithm({ algorithm, setAlgorithm, quantum, setQuantum, disabled }) {
  return (
    <div className="algorithm-card pane-box">
      <div className="card-header">
        <div className="icon-wrapper algo-icon">
          <Settings size={18} />
        </div>
        <h2>Algorithm</h2>
      </div>

      <div className="algo-button-group">
        <button
          className={`algo-pill ${algorithm === "FCFS" ? "active" : ""}`}
          onClick={() => setAlgorithm("FCFS")}
          disabled={disabled}
        >
          FCFS
        </button>
        <button
          className={`algo-pill ${algorithm === "RR" ? "active" : ""}`}
          onClick={() => setAlgorithm("RR")}
          disabled={disabled}
        >
          RR
        </button>
      </div>

      {algorithm === "RR" && (
        <div className="quantum-section animate-fade-in">
          <div className="quantum-header">
            <span className="quantum-label">TIME QUANTUM</span>
            <span className="quantum-hint">Smaller = more responsive<br/>Larger = less overhead</span>
          </div>
          <div className="quantum-input-box">
            <input
              type="number"
              min="1"
              value={quantum}
              onChange={(e) => setQuantum(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="algo-info-box">
            <h3>Round Robin</h3>
            <p>Each process gets a fixed time slice. If unfinished, it re-enters the queue.</p>
            <ul className="feature-list">
              <li><Check size={14} className="text-success" /> Fair, good response time, no starvation</li>
              <li><X size={14} className="text-danger" /> Higher avg WT; depends on quantum size</li>
            </ul>
          </div>
        </div>
      )}
      
      {algorithm === "FCFS" && (
        <div className="quantum-section animate-fade-in">
          <div className="algo-info-box" style={{ marginTop: "1rem" }}>
            <h3>First Come First Serve</h3>
            <p>Processes are executed in the exact order they arrive in the ready queue.</p>
            <ul className="feature-list">
              <li><Check size={14} className="text-success" /> Simple to understand and implement</li>
              <li><X size={14} className="text-danger" /> Can suffer from the Convoy Effect</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
