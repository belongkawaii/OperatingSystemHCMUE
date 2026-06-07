export default function ProcessTable({
  algorithm,
  setAlgorithm,

  quantum,
  setQuantum,

  processes,
  setProcesses,

  locked,
}) {

  const addProcess = () => {

    const nextId =
      processes.length > 0
        ? Math.max(
            ...processes.map(
              p => p.id
            )
          ) + 1
        : 1;

    setProcesses([
      ...processes,
      {
        id: nextId,

        arrivalTime: 0,

        burstTime: 5,

        ioStartTime: 2,

        ioTime: 2,
      },
    ]);
  };

  const removeProcess = (
    id
  ) => {

    setProcesses(
      processes.filter(
        p => p.id !== id
      )
    );
  };

  const updateField = (
    id,
    field,
    value
  ) => {

    setProcesses(
      processes.map(p =>
        p.id === id
          ? {
              ...p,
              [field]:
                Number(value),
            }
          : p
      )
    );
  };

  return (
    <div>

      <h2 className="panel-title">
        Process Configuration
      </h2>

      <div className="form-group">

        <label>
          Algorithm
        </label>

        <select
          disabled={locked}
          value={algorithm}
          onChange={(e) =>
            setAlgorithm(
              e.target.value
            )
          }
        >
          <option value="FCFS">
            FCFS
          </option>

          <option value="RR">
            RR
          </option>
        </select>

      </div>

      {algorithm === "RR" && (

        <div className="form-group">

          <label>
            Quantum
          </label>

          <input
            disabled={locked}
            type="number"
            min="1"
            value={quantum}
            onChange={(e) =>
              setQuantum(
                Number(
                  e.target.value
                )
              )
            }
          />

        </div>

      )}

      <button
        disabled={locked}
        className="primary-btn"
        onClick={addProcess}
      >
        Add Process
      </button>

      <div className="process-table-wrapper">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Arrival</th>

              <th>Burst</th>

              <th>IO Start</th>

              <th>IO Time</th>

              <th>Delete</th>

            </tr>

          </thead>

          <tbody>

            {processes.map(
              process => (

                <tr
                  key={
                    process.id
                  }
                >

                  <td>
                    P
                    {
                      process.id
                    }
                  </td>

                  <td>

                    <input
                      disabled={locked}
                      type="number"
                      min="0"
                      value={
                        process.arrivalTime
                      }
                      onChange={(e)=>
                        updateField(
                          process.id,
                          "arrivalTime",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td>

                    <input
                      disabled={locked}
                      type="number"
                      min="1"
                      value={
                        process.burstTime
                      }
                      onChange={(e)=>
                        updateField(
                          process.id,
                          "burstTime",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td>

                    <input
                      disabled={locked}
                      type="number"
                      min="0"
                      value={
                        process.ioStartTime
                      }
                      onChange={(e)=>
                        updateField(
                          process.id,
                          "ioStartTime",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td>

                    <input
                      disabled={locked}
                      type="number"
                      min="0"
                      value={
                        process.ioTime
                      }
                      onChange={(e)=>
                        updateField(
                          process.id,
                          "ioTime",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td>

                    <button
                      disabled={locked}
                      className="delete-btn"
                      onClick={() =>
                        removeProcess(
                          process.id
                        )
                      }
                    >
                      X
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}