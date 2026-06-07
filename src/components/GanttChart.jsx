export default function GanttChart({
  snapshots,
}) {
  if (
    snapshots.length === 0
  ) {
    return (
      <div>
        <h2 className="panel-title">
          Gantt Chart
        </h2>

        <p>
          No simulation data
        </p>
      </div>
    );
  }

  const latest =
    snapshots[
      snapshots.length - 1
    ];

  const processes =
    latest.processes;

  const timelineLength =
    Math.max(
      ...processes.map(
        (p) =>
          p.stateHistory.length
      )
    );

  return (
    <div className="gantt-container">

      <h2 className="panel-title">
        CPU Scheduling Timeline
      </h2>

      <div className="legend">

        <div>
          <span className="legend-box running"></span>
          Running
        </div>

        <div>
          <span className="legend-box ready"></span>
          Ready
        </div>

        <div>
          <span className="legend-box io"></span>
          I/O
        </div>

        <div>
          <span className="legend-box completed"></span>
          Completed
        </div>

      </div>

      <div className="gantt-wrapper">

        {/* TIME AXIS */}

        <div className="time-row">

          <div className="process-label">
            Time
          </div>

          <div className="timeline">

            {Array.from({
              length:
                timelineLength,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="time-cell"
                >
                  {index}
                </div>
              )
            )}

          </div>

        </div>

        {/* PROCESS ROWS */}

        {processes.map(
          (process) => (

            <div
              key={process.id}
              className="gantt-row"
            >

              <div className="process-label">
                P{process.id}
              </div>

              <div className="timeline">

                {process.stateHistory.map(
                  (
                    state,
                    index
                  ) => (

                    <div
                      key={index}
                      className={`gantt-cell ${state}`}
                      title={state}
                    />

                  )
                )}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}