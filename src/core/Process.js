export const PROCESS_COLORS = [
  '#2563eb',
  '#0f766e',
  '#d97706',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#65a30d',
  '#c2410c',
]

export const DEFAULT_PROCESSES = [
  { uid: 'process-1', id: 'P1', arrival: 0, burst: 5, priority: 2, color: PROCESS_COLORS[0] },
  { uid: 'process-2', id: 'P2', arrival: 1, burst: 3, priority: 1, color: PROCESS_COLORS[1] },
  { uid: 'process-3', id: 'P3', arrival: 2, burst: 8, priority: 4, color: PROCESS_COLORS[2] },
  { uid: 'process-4', id: 'P4', arrival: 3, burst: 6, priority: 3, color: PROCESS_COLORS[3] },
]

export function normalizeProcesses(processes) {
  return processes
    .map((process, index) => {
      const arrival = Number(process.arrival)
      const burst = Number(process.burst)
      const priority = Number(process.priority)

      return {
        ...process,
        id: String(process.id || `P${index + 1}`).trim() || `P${index + 1}`,
        arrival: Number.isFinite(arrival) && arrival >= 0 ? Math.floor(arrival) : 0,
        burst: Number.isFinite(burst) && burst > 0 ? Math.floor(burst) : 1,
        priority: Number.isFinite(priority) ? Math.floor(priority) : 1,
        color: process.color || PROCESS_COLORS[index % PROCESS_COLORS.length],
        order: index,
      }
    })
    .filter((process) => process.burst > 0)
}

export function createProcess(index) {
  return {
    uid: `process-${Date.now()}-${index}`,
    id: `P${index}`,
    arrival: 0,
    burst: 4,
    priority: 1,
    color: PROCESS_COLORS[(index - 1) % PROCESS_COLORS.length],
  }
}
