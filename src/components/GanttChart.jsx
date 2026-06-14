import { useMemo } from "react";
import { BarChart3, Clock, RotateCcw, Activity, Zap, Check, Cpu } from "lucide-react";

export default function GanttChart({ snapshots, blocks, currentStep, finished, processes }) {

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

    // Compute CPU blocks including IDLE states
    const cpuBlocksWithIdle = useMemo(() => {
        if (currentStep < 0 || !blocks || blocks.length === 0 || !snapshots || snapshots.length === 0) return [];
        const maxTime = blocks[Math.min(currentStep, blocks.length - 1)]?.end || 0;
        
        const list = [];
        let current = null;
        
        for (let t = 0; t < maxTime; t++) {
            const snap = snapshots[t];
            const runningProc = snap ? snap.processes.find(p => p.stateHistory[t] === "RUNNING") : null;
            const procId = runningProc ? runningProc.id : null;
            
            if (current && current.id === procId) {
                current.end = t + 1;
            } else {
                if (current) list.push(current);
                current = {
                    id: procId,
                    start: t,
                    end: t + 1,
                    color: procId ? (colorMap[procId] || "#6366f1") : "transparent"
                };
            }
        }
        if (current) list.push(current);
        return list;
    }, [currentStep, blocks, snapshots, colorMap]);

    // Compute I/O blocks including IDLE states
    const ioBlocksWithIdle = useMemo(() => {
        if (currentStep < 0 || !blocks || blocks.length === 0 || !snapshots || snapshots.length === 0) return [];
        const maxTime = blocks[Math.min(currentStep, blocks.length - 1)]?.end || 0;
        
        const list = [];
        let current = null;
        
        for (let t = 0; t < maxTime; t++) {
            const snap = snapshots[t];
            const procId = snap ? snap.runningIoProcessId : null;
            
            if (current && current.id === procId) {
                current.end = t + 1;
            } else {
                if (current) list.push(current);
                current = {
                    id: procId,
                    start: t,
                    end: t + 1,
                    color: procId ? (colorMap[procId] || "#6366f1") : "transparent"
                };
            }
        }
        if (current) list.push(current);
        return list;
    }, [currentStep, blocks, snapshots, colorMap]);

    // Compute total units as the elapsed time of the simulation blocks at currentStep
    const totalUnits = useMemo(() => {
        if (currentStep < 0 || !blocks || blocks.length === 0) return 0;
        return blocks[Math.min(currentStep, blocks.length - 1)]?.end || 0;
    }, [currentStep, blocks]);

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
            
            // Calculate CPU Utilization %
            let busyTicks = 0;
            const totalDuration = snapshots.length - 1;
            if (totalDuration > 0) {
                for (let t = 0; t < totalDuration; t++) {
                    const snap = snapshots[t];
                    const hasRunning = snap.processes.some(p => p.stateHistory[t] === "RUNNING");
                    if (hasRunning) {
                        busyTicks++;
                    }
                }
            }
            const cpuUtil = totalDuration > 0 ? ((busyTicks / totalDuration) * 100).toFixed(2) : "0.00";

            return {
                stats: processStats,
                avgWT: (totalWT / n).toFixed(2),
                avgTAT: (totalTAT / n).toFixed(2),
                avgCT: (totalCT / n).toFixed(2),
                avgRT: (totalRT / n).toFixed(2),
                cpuUtil,
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
                    {/* CPU Row */}
                    <div className="gantt-row-label">CPU Execution</div>
                    <div className="gantt-blocks">
                        {cpuBlocksWithIdle.map((block, idx) => {
                            const duration = block.end - block.start;
                            const isIdle = !block.id;
                            return (
                                <div
                                    key={idx}
                                    className={`gantt-block ${isIdle ? 'idle-block' : ''}`}
                                    style={{
                                        flexGrow: duration,
                                        flexShrink: 0,
                                        flexBasis: 0,
                                        minWidth: 0,
                                        backgroundColor: block.color,
                                        boxShadow: isIdle ? 'none' : `0 8px 16px ${block.color}40`
                                    }}
                                >
                                    <div className="gantt-block-content">
                                        <strong>{block.id || "IDLE"}</strong>
                                        <small>{duration}u</small>
                                    </div>
                                </div>
                            );
                        })}
                        {cpuBlocksWithIdle.length === 0 && (
                            <div className="gantt-empty">
                                {currentStep < 0 ? "Not Started" : "CPU Idle"}
                            </div>
                        )}
                    </div>
                    <div className="gantt-timeline-bar"></div>
                    <div className="gantt-timeline-labels" style={{ marginBottom: "1.5rem" }}>
                        <span className="timeline-start">0</span>
                        {cpuBlocksWithIdle.map((block, idx) => (
                            <span key={idx} className="timeline-point" style={{ flexGrow: block.end - block.start, flexShrink: 0, flexBasis: 0, minWidth: 0 }}>
                                {block.end}
                            </span>
                        ))}
                    </div>

                    {/* I/O Row */}
                    <div className="gantt-row-label">I/O Execution</div>
                    <div className="gantt-blocks">
                        {ioBlocksWithIdle.map((block, idx) => {
                            const duration = block.end - block.start;
                            const isIdle = !block.id;
                            return (
                                <div
                                    key={idx}
                                    className={`gantt-block ${isIdle ? 'idle-block' : ''}`}
                                    style={{
                                        flexGrow: duration,
                                        flexShrink: 0,
                                        flexBasis: 0,
                                        minWidth: 0,
                                        backgroundColor: block.color,
                                        boxShadow: isIdle ? 'none' : `0 8px 16px ${block.color}40`
                                    }}
                                >
                                    <div className="gantt-block-content">
                                        <strong>{block.id || "IDLE"}</strong>
                                        <small>{duration}u</small>
                                    </div>
                                </div>
                            );
                        })}
                        {ioBlocksWithIdle.length === 0 && (
                            <div className="gantt-empty">
                                {currentStep < 0 ? "Not Started" : "I/O Idle"}
                            </div>
                        )}
                    </div>
                    <div className="gantt-timeline-bar"></div>
                    <div className="gantt-timeline-labels">
                        <span className="timeline-start">0</span>
                        {ioBlocksWithIdle.map((block, idx) => (
                            <span key={idx} className="timeline-point" style={{ flexGrow: block.end - block.start, flexShrink: 0, flexBasis: 0, minWidth: 0 }}>
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
                            <div className="metric-card glow-pink">
                                <Cpu size={20} className="metric-card-icon" />
                                <div className="metric-value">
                                    {metrics.cpuUtil}
                                    <span className="metric-unit">%</span>
                                </div>
                                <h4>CPU UTILIZATION</h4>
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