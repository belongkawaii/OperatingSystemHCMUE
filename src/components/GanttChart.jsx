const UNIT_WIDTH = 52

function GanttChart({ timeline, totalTime }) {
  const chartWidth = Math.max(640, Math.max(totalTime, 1) * UNIT_WIDTH)
  const markers = Array.from({ length: totalTime + 1 }, (_, index) => index)

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="section-label">Bên phải</p>
          <h2>Gantt chart</h2>
        </div>
        <span className="chart-summary">{timeline.length} đoạn chạy</span>
      </div>

      <div className="gantt-scroll" role="img" aria-label="Biểu đồ Gantt của lịch CPU">
        <div className="gantt-canvas" style={{ width: `${chartWidth}px` }}>
          <div className="gantt-bars">
            {timeline.map((segment, index) => {
              const start = segment.start * UNIT_WIDTH
              const width = Math.max((segment.end - segment.start) * UNIT_WIDTH, UNIT_WIDTH)

              return (
                <div
                  className={`gantt-segment ${segment.idle ? 'is-idle' : ''}`}
                  key={`${segment.id}-${segment.start}-${index}`}
                  style={{
                    left: `${start}px`,
                    width: `${width}px`,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.label}: ${segment.start} - ${segment.end}`}
                >
                  <span>{segment.label}</span>
                </div>
              )
            })}
          </div>

          <div className="gantt-axis">
            {markers.map((marker) => (
              <span
                className="axis-marker"
                key={marker}
                style={{ left: `${marker * UNIT_WIDTH}px` }}
              >
                {marker}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default GanttChart
