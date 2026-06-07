export default function Statistics({
  snapshots,
}) {

  if (
    snapshots.length === 0
  ) {
    return (
      <div>

        <h2 className="panel-title">
          Statistics
        </h2>

        <p>
          No simulation
          data yet.
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

  const finished =
    processes.filter(
      p =>
        p.completionTime !==
        null
    );

  if (
    finished.length === 0
  ) {
    return (
      <div>

        <h2 className="panel-title">
          Statistics
        </h2>

        <p>
          Waiting for
          simulation...
        </p>

      </div>
    );
  }

  // ==================
  // CALCULATIONS
  // ==================

  const avgWaiting =
    finished.reduce(
      (sum, p) =>
        sum +
        p.waitingTime,
      0
    ) /
    finished.length;

  const avgResponse =
    finished.reduce(
      (sum, p) =>
        sum +
        p.responseTime,
      0
    ) /
    finished.length;

  const avgTurnaround =
    finished.reduce(
      (sum, p) =>
        sum +
        (
          p.completionTime -
          p.arrivalTime
        ),
      0
    ) /
    finished.length;

  const totalTime =
    latest.currentTime || 1;

  const cpuBusy =
    processes.reduce(
      (sum, p) =>
        sum +
        p.burstTime,
      0
    );

  const cpuUtil =
    (
      cpuBusy /
      totalTime
    ) *
    100;

  const throughput =
    (
      finished.length /
      totalTime
    );

  return (
    <div>

      <h2 className="panel-title">
        Statistics
      </h2>

      <div className="stat-card">
        <h3>
          Average Waiting Time
        </h3>

        <p>
          {
            avgWaiting.toFixed(
              2
            )
          }
        </p>
      </div>

      <div className="stat-card">
        <h3>
          Average Turnaround Time
        </h3>

        <p>
          {
            avgTurnaround.toFixed(
              2
            )
          }
        </p>
      </div>

      <div className="stat-card">
        <h3>
          Average Response Time
        </h3>

        <p>
          {
            avgResponse.toFixed(
              2
            )
          }
        </p>
      </div>

      <div className="stat-card">
        <h3>
          CPU Utilization
        </h3>

        <p>
          {
            cpuUtil.toFixed(
              2
            )
          }
          %
        </p>
      </div>

      <div className="stat-card">
        <h3>
          Throughput
        </h3>

        <p>
          {
            throughput.toFixed(
              2
            )
          }
        </p>
      </div>

      <div className="stat-card">
        <h3>
          Total Time
        </h3>

        <p>
          {totalTime}
        </p>
      </div>

    </div>
  );
}