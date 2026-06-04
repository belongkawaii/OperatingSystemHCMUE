function ProcessTable({ processes, onAdd, onUpdate, onRemove }) {
  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="section-label">Bên trái</p>
          <h2>Nhập tiến trình</h2>
        </div>
        <button className="primary-button" type="button" onClick={onAdd}>
          Thêm
        </button>
      </div>

      <div className="table-wrap">
        <table className="process-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Priority</th>
              <th>
                <span className="sr-only">Xóa</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.uid}>
                <td>
                  <input
                    aria-label="Tên tiến trình"
                    className="text-input process-id-input"
                    value={process.id}
                    onChange={(event) => onUpdate(process.uid, 'id', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Arrival time của ${process.id}`}
                    className="number-input"
                    min="0"
                    type="number"
                    value={process.arrival}
                    onChange={(event) => onUpdate(process.uid, 'arrival', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Burst time của ${process.id}`}
                    className="number-input"
                    min="1"
                    type="number"
                    value={process.burst}
                    onChange={(event) => onUpdate(process.uid, 'burst', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Độ ưu tiên của ${process.id}`}
                    className="number-input"
                    type="number"
                    value={process.priority}
                    onChange={(event) => onUpdate(process.uid, 'priority', event.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Xóa ${process.id}`}
                    title={`Xóa ${process.id}`}
                    onClick={() => onRemove(process.uid)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ProcessTable
