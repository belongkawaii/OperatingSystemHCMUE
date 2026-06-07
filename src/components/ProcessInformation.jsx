export default function ProcessInformation({
  snapshots,
}) {

  return (
    <div>

      <h2 className="panel-title">
        Process Information
      </h2>

      {snapshots.length === 0 ? (

        <p>
          No process data
        </p>

      ) : (

        <div className="process-info-table">

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Arrival</th>

                <th>Burst</th>

                <th>Waiting</th>

                <th>Response</th>

                <th>Completion</th>

              </tr>

            </thead>

            <tbody>

              {snapshots[
                snapshots.length - 1
              ].processes.map(
                (p) => (

                  <tr key={p.id}>

                    <td>
                      P{p.id}
                    </td>

                    <td>
                      {p.arrivalTime}
                    </td>

                    <td>
                      {p.burstTime}
                    </td>

                    <td>
                      {p.waitingTime}
                    </td>

                    <td>
                      {p.responseTime ?? "-"}
                    </td>

                    <td>
                      {p.completionTime ?? "-"}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}