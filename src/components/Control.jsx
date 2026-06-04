function Control({
  algorithm,
  algorithms,
  timeQuantum,
  onAlgorithmChange,
  onQuantumChange,
  onReset,
}) {
  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="section-label">Dưới trái</p>
          <h2>Chọn thuật toán</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="algorithm-list" role="radiogroup" aria-label="Thuật toán lập lịch CPU">
        {algorithms.map((item) => (
          <label
            className={`algorithm-option ${algorithm === item.value ? 'is-active' : ''}`}
            key={item.value}
          >
            <input
              checked={algorithm === item.value}
              name="algorithm"
              type="radio"
              value={item.value}
              onChange={(event) => onAlgorithmChange(event.target.value)}
            />
            <span className="algorithm-name">{item.label}</span>
            <span className="algorithm-description">{item.description}</span>
          </label>
        ))}
      </div>

      <div className="quantum-row">
        <label htmlFor="time-quantum">Time quantum</label>
        <input
          id="time-quantum"
          className="number-input"
          disabled={algorithm !== 'rr'}
          min="1"
          type="number"
          value={timeQuantum}
          onChange={(event) => onQuantumChange(event.target.value)}
        />
      </div>
    </>
  )
}

export default Control
