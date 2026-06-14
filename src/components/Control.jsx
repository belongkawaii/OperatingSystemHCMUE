import { Play, Pause, SkipForward, RotateCcw, Settings2, Check } from "lucide-react";

export default function Control({
  start,
  pause,
  reset,
  skipStep,
  stepMode,
  setStepMode,
  canStart,
  canPause,
  canSkip,
  running,
  finished,
  progress,
  hasStarted
}) {
  return (
    <div className="control-card pane-box">
      <div className="card-header">
        <div className="flex-center gap-sm">
          <div className="icon-wrapper control-icon">
            <Settings2 size={18} />
          </div>
          <h2>Controls</h2>
        </div>
      </div>
      
      <div className="control-grid">
        <button
          className={`grid-btn btn-start ${running ? 'active' : ''}`}
          onClick={start}
          disabled={!canStart}
        >
          <Play size={16} fill="currentColor" /> {running ? "Running..." : "Start"}
        </button>
        
        <button
          className={`grid-btn btn-pause ${!running && hasStarted && !finished && !stepMode ? 'active' : ''}`}
          onClick={pause}
          disabled={!canPause}
        >
          <Pause size={16} fill="currentColor" /> Pause
        </button>

        <button
          className="grid-btn btn-step"
          onClick={skipStep}
          disabled={!canSkip}
        >
          <SkipForward size={16} /> Step
        </button>

        <button
          className="grid-btn btn-reset"
          onClick={reset}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      <div className="step-mode-section">
        <div className="step-mode-info">
          <h4>Step-by-Step Mode</h4>
          <span className="step-hint">Manual control for execution demo</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={stepMode}
            onChange={(e) => setStepMode(e.target.checked)}
            disabled={hasStarted}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-value">{progress}</span>
        </div>
        <div className="progress-bar-container">
          {/* We can parse progress like "2/10" to get percentage */}
          {(() => {
            let pct = 0;
            if (progress && progress.includes('/')) {
              const [curr, tot] = progress.split('/');
              if (Number(tot) > 0) {
                pct = (Number(curr) / Number(tot)) * 100;
              }
            }
            return (
              <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
            );
          })()}
        </div>
        {finished && (
          <div className="simulation-complete">
            <Check size={14} className="text-success" />
            <span className="text-success">Simulation complete</span>
          </div>
        )}
      </div>
    </div>
  );
}
