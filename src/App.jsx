import { useSimulator } from './hooks/useSimulator'
import Control from './components/Control'
import GanttChart from './components/GanttChart'
import ProcessTable from './components/ProcessTable'
import './App.css'

function MetricCard({ label, value, unit }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
    </div>
  )
}

function App() {
  const {
    processes,
    algorithm,
    algorithmOptions,
    timeQuantum,
    simulation,
    addProcess,
    updateProcess,
    removeProcess,
    resetProcesses,
    setAlgorithm,
    setTimeQuantum,
  } = useSimulator()

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">CPU Scheduling Simulator</p>
          <h1>Mô phỏng lập lịch CPU</h1>
        </div>
        <div className="status-pill">
          <span className="status-dot"></span>
          Tự động cập nhật
        </div>
      </header>

      <section className="simulator-grid" aria-label="Bố cục mô phỏng lập lịch CPU">
        <section className="panel process-panel" aria-label="Nhập tiến trình">
          <ProcessTable
            processes={processes}
            onAdd={addProcess}
            onUpdate={updateProcess}
            onRemove={removeProcess}
          />
        </section>

        <section className="panel gantt-panel" aria-label="Biểu đồ Gantt">
          <GanttChart timeline={simulation.timeline} totalTime={simulation.metrics.totalTime} />
        </section>

        <section className="panel control-panel" aria-label="Chọn thuật toán">
          <Control
            algorithm={algorithm}
            algorithms={algorithmOptions}
            timeQuantum={timeQuantum}
            onAlgorithmChange={setAlgorithm}
            onQuantumChange={setTimeQuantum}
            onReset={resetProcesses}
          />
        </section>

        <section className="panel metrics-panel" aria-label="Thông số hiệu năng">
          <div className="panel-heading">
            <div>
              <p className="section-label">Kết quả</p>
              <h2>Thông số hiệu năng</h2>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCard
              label="Chờ trung bình"
              value={simulation.metrics.averageWaitingTime}
              unit=" time"
            />
            <MetricCard
              label="Hoàn thành trung bình"
              value={simulation.metrics.averageTurnaroundTime}
              unit=" time"
            />
            <MetricCard
              label="Phản hồi trung bình"
              value={simulation.metrics.averageResponseTime}
              unit=" time"
            />
            <MetricCard
              label="Hiệu suất CPU"
              value={simulation.metrics.cpuUtilization}
              unit="%"
            />
            <MetricCard
              label="Throughput"
              value={simulation.metrics.throughput}
              unit="/time"
            />
            <MetricCard label="Tổng thời gian" value={simulation.metrics.totalTime} unit=" time" />
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
