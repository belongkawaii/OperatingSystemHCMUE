import React, { useMemo } from "react";
import { BarChart3, Clock, RotateCcw, Activity, Zap, Check } from "lucide-react";

export default function GanttChart({ snapshots, blocks, currentStep, finished, processes }) {
  const visibleBlocks = useMemo(() => {
    if (currentStep < 0 || !blocks || blocks.length === 0) return [];
    return blocks.slice(0, currentStep + 1);
  }, [blocks, currentStep]);

  // Use the original `processes` array (which has colors) to create a color map
  const colorMap = useMemo(() => {
    const map = {};
    if (processes) {
      processes.forEach(p => {
        map[p.id] = p.color;
      });
    }
    return map;
  }, [processes]);

  const displayBlocks = useMemo(() => {
    return visibleBlocks.map(b => ({
      ...b,
      color: colorMap[b.id] || "#6366f1"
    }));
  }, [visibleBlocks, colorMap]);

  // Get total units for the Gantt chart from the LAST block's end time, 
  // or from snapshots if finished.
  const totalUnits = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return 0;
    return snapshots.length;
  }, [snapshots]);

  // Calculate Metrics if finished
  const metrics = useMemo(() => {
    try {
      if (!finished || !snapshots || snapshots.length === 0) return null;

      const finalSnap = snapshots[snapshots.length - 1];
      if (!finalSnap || !finalSnap.processes) return null;

      let totalWT = 0;
      let totalTAT = 0;
      let totalCT = 0;
      let totalRT = 0;

      const processStats = finalSnap.processes.map(p => {
        let ct = 0;
        let rt = -1;
        let wt = 0;

        for (let t = 0; t < p.stateHistory.length; t++) {
          if (p.stateHistory[t] === "RUNNING" && rt === -1) {
            rt = t - p.arrivalTime;
          }
          if (p.stateHistory[t] === "COMPLETED" && ct === 0) {
            ct = t;
          }
          if (p.stateHistory[t] === "READY") {
            wt++;
          }
        }

        if (ct === 0 && p.isCompleted && p.isCompleted()) {
           ct = p.stateHistory.length;
        } else if (ct === 0 && !p.isCompleted) {
           ct = p.stateHistory.length;
        }

        const tat = ct - p.arrivalTime;

        totalWT += wt;
        totalTAT += tat;
        totalCT += ct;
        totalRT += rt === -1 ? 0 : rt; 

        return {
          id: p.id,
          color: colorMap[p.id] || "#ffffff",
          at: p.arrivalTime,
          bt: p.burstTime,
          ct,
          tat,
          wt,
          rt: rt === -1 ? "-" : rt
        };
      });

      const n = finalSnap.processes.length || 1; // Prevent div by 0
      return {
        stats: processStats,
        avgWT: (totalWT / n).toFixed(2),
        avgTAT: (totalTAT / n).toFixed(2),
        avgCT: (totalCT / n).toFixed(2),
        avgRT: (totalRT / n).toFixed(2),
      };
    } catch (err) {
      console.error("Error calculating metrics:", err);
      return null;
    }
  }, [finished, snapshots, colorMap]);

  return (
    <div className="right-panels">
      <div className="gantt-container pane-box">
        <div className="card-header">
          <div className="flex-center gap-sm">
            <div className="icon-wrapper chart-icon">
              <BarChart3 size={18} />
            </div>
            <h2>Gantt Chart</h2>
          </div>
          <div className="total-units-badge">
            <Clock size={14} />
            <span>Total: <strong>{totalUnits}</strong> units</span>
          </div>
        </div>

        <div className="gantt-chart-display">
          <div className="gantt-blocks">
            {displayBlocks.map((block, idx) => {
               const duration = block.end - block.start;
               return (
                 <div
                   key={idx}
                   className="gantt-block"
                   style={{
                     flexGrow: duration,
                     backgroundColor: block.color,
                     boxShadow: `0 8px 16px ${block.color}40`
                   }}
                 >
                   <div className="gantt-block-content">
                     <strong>{block.id}</strong>
                     <small>{duration}u</small>
                   </div>
                 </div>
               );
            })}
            {displayBlocks.length === 0 && (
              <div className="gantt-empty">
                {currentStep < 0 ? "Not Started" : "CPU Idle"}
              </div>
            )}
          </div>
          <div className="gantt-timeline-bar"></div>
          <div className="gantt-timeline-labels">
             <span className="timeline-start">0</span>
             {displayBlocks.map((block, idx) => (
                <span key={idx} className="timeline-point" style={{ flexGrow: block.end - block.start }}>
                   {block.end}
                </span>
             ))}
          </div>
        </div>

        <div className="gantt-footer">
          <span className="timeline-label">→ TIMELINE</span>
          <div className="process-legend-inline">
            {processes && processes.map(p => (
              <div key={p.id} className="legend-item-inline">
                <div className="color-dot" style={{ backgroundColor: p.color }}></div>
                <span>{p.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="metrics-container pane-box">
        <div className="card-header">
          <div className="flex-center gap-sm">
            <div className="icon-wrapper metrics-icon">
              <Activity size={18} />
            </div>
            <h2>Performance Metrics</h2>
          </div>
        </div>

        {finished && metrics ? (
          <>
            <div className="metrics-cards animate-fade-in">
              <div className="metric-card glow-orange">
                <Clock size={20} className="metric-card-icon" />
                <div className="metric-value">{metrics.avgWT}</div>
                <h4>AVG WAITING TIME</h4>
              </div>
              <div className="metric-card glow-purple">
                <RotateCcw size={20} className="metric-card-icon" />
                <div className="metric-value">{metrics.avgTAT}</div>
                <h4>AVG TURNAROUND</h4>
              </div>
              <div className="metric-card glow-green">
                <Check size={20} className="metric-card-icon" />
                <div className="metric-value">{metrics.avgCT}</div>
                <h4>AVG COMPLETION</h4>
              </div>
              <div className="metric-card glow-blue">
                <Zap size={20} className="metric-card-icon" />
                <div className="metric-value">{metrics.avgRT}</div>
                <h4>AVG RESPONSE</h4>
              </div>
            </div>

            <div className="process-details animate-fade-in">
              <table className="details-table">
                <thead>
                  <tr>
                    <th className="text-left">PROCESS</th>
                    <th>AT</th>
                    <th>BT</th>
                    <th>CT</th>
                    <th>TAT</th>
                    <th>WT</th>
                    <th>RT</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.stats.map(s => (
                    <tr key={s.id}>
                      <td className="text-left">
                        <div className="flex-center-left">
                          <div className="color-dot" style={{ backgroundColor: s.color, marginRight: "8px" }}></div>
                          <span className="text-bold">{s.id}</span>
                        </div>
                      </td>
                      <td>{s.at}</td>
                      <td>{s.bt}</td>
                      <td className="text-green text-bold">{s.ct}</td>
                      <td className="text-purple text-bold">{s.tat}</td>
                      <td className="text-orange text-bold">{s.wt}</td>
                      <td className="text-blue text-bold">{s.rt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-legend">
                AT = Arrival Time &nbsp;&nbsp; BT = Burst Time &nbsp;&nbsp; CT = Completion Time &nbsp;&nbsp; TAT = Turnaround Time &nbsp;&nbsp; WT = Waiting Time &nbsp;&nbsp; RT = Response Time
              </div>
            </div>
          </>
        ) : (
          <div className="metrics-placeholder">
             Run the simulation to completion to see performance metrics.
          </div>
        )}
      </div>
    </div>
  );
}
