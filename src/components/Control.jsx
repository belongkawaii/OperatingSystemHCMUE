export default function Control({
  running,
  finished,

  speed,
  setSpeed,

  setRunning,

  nextStep,

  initialize,

  resetSimulation,
}) {
  return (
    <div>

      <h2 className="panel-title">
        Simulation Control
      </h2>

      {/* ====================== */}
      {/* INITIALIZE */}
      {/* ====================== */}

      <button
        className="primary-btn"
        onClick={initialize}
      >
        Initialize Simulation
      </button>

      {/* ====================== */}
      {/* RUN / PAUSE */}
      {/* ====================== */}

      <button
        className={
          running
            ? "danger-btn"
            : "success-btn"
        }
        disabled={finished}
        onClick={() =>
          setRunning(!running)
        }
      >
        {finished
          ? "Simulation Finished"
          : running
          ? "Pause"
          : "Run"}
      </button>

      {/* ====================== */}
      {/* STEP */}
      {/* ====================== */}

      <button
        className="secondary-btn"
        disabled={finished}
        onClick={nextStep}
      >
        Skip 1 Snapshot
      </button>

      {/* ====================== */}
      {/* RESET */}
      {/* ====================== */}

      <button
        className="reset-btn"
        onClick={resetSimulation}
      >
        Reset
      </button>

      {/* ====================== */}
      {/* SPEED */}
      {/* ====================== */}

      <div className="control-group">

        <label>
          Simulation Speed
        </label>

        <select
          value={speed}
          onChange={(e) =>
            setSpeed(
              Number(
                e.target.value
              )
            )
          }
        >
          <option value={0.5}>
            0.5x
          </option>

          <option value={1}>
            1x
          </option>

          <option value={2}>
            2x
          </option>

          <option value={3}>
            3x
          </option>

          <option value={5}>
            5x
          </option>

          <option value={10}>
            10x
          </option>
        </select>
      </div>

      {/* ====================== */}
      {/* STATUS */}
      {/* ====================== */}

      <div className="status-box">

        <h3>Status</h3>

        <p>
          Running:
          {" "}
          {running
            ? "YES"
            : "NO"}
        </p>

        <p>
          Finished:
          {" "}
          {finished
            ? "YES"
            : "NO"}
        </p>

        <p>
          Speed:
          {" "}
          {speed}x
        </p>

      </div>

    </div>
  );
}