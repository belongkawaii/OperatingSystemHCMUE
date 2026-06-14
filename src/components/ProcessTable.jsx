import { Plus, X, ClipboardList } from 'lucide-react';

export default function ProcessTable({
  processes,
  addProcess,
  deleteProcess,
  updateProcess,
  disabled
}) {
  return (
    <div className="process-table-card pane-box">
      <div className="card-header">
        <div className="flex-center gap-sm">
          <div className="icon-wrapper table-icon">
            <ClipboardList size={18} />
          </div>
          <h2>Process Table</h2>
        </div>
        <button className="btn primary-btn add-btn" onClick={addProcess} disabled={disabled}>
          <Plus size={16} /> Add Process
        </button>
      </div>

      <div className="table-wrapper">
        <table className="process-table">
          <thead>
            <tr>
              <th className="w-5 text-center"></th>
              <th className="w-10">PID</th>
              <th>ARRIVAL</th>
              <th>BURST</th>
              <th>PRIORITY</th>
              <th>IO START</th>
              <th>IO TIME</th>
              <th className="w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id}>
                <td className="text-center">
                  <div
                    className="color-indicator-circle"
                    style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}80` }}
                  ></div>
                </td>
                <td>
                  <span className="pid-pill">{p.id}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.arrivalTime}
                    onChange={(e) => updateProcess(p.id, "arrivalTime", e.target.value)}
                    disabled={disabled}
                    className="input-dark"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={p.burstTime}
                    onChange={(e) => updateProcess(p.id, "burstTime", e.target.value)}
                    disabled={disabled}
                    className="input-dark"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.priority}
                    onChange={(e) => updateProcess(p.id, "priority", e.target.value)}
                    disabled={disabled}
                    className="input-dark"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.ioStartTime === null ? "" : p.ioStartTime}
                    onChange={(e) => updateProcess(p.id, "ioStartTime", e.target.value)}
                    disabled={disabled}
                    className="input-dark"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={p.ioTime}
                    onChange={(e) => updateProcess(p.id, "ioTime", e.target.value)}
                    disabled={disabled}
                    className="input-dark"
                  />
                </td>
                <td className="text-center">
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => deleteProcess(p.id)}
                    disabled={disabled || processes.length <= 1}
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="process-count">{processes.length} processes configured</span>
        <div className="color-stack">
          {processes.map((p, idx) => (
             <div 
               key={idx} 
               className="color-stack-item" 
               style={{ backgroundColor: p.color, zIndex: processes.length - idx }}
             ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
