function pushSegment(timeline, segment) {
  const last = timeline[timeline.length - 1]

  if (last && last.id === segment.id && last.idle === segment.idle && last.end === segment.start) {
    last.end = segment.end
    return
  }

  timeline.push(segment)
}

function addIdleSegment(timeline, start, end) {
  if (end <= start) return

  pushSegment(timeline, {
    id: 'IDLE',
    label: 'Idle',
    start,
    end,
    color: '#cbd5e1',
    idle: true,
  })
}

function createSegment(process, start, end) {
  return {
    id: process.uid,
    processId: process.id,
    label: process.id,
    start,
    end,
    color: process.color,
    idle: false,
  }
}

function cloneReady(processes) {
  return processes.map((process) => ({
    ...process,
    remaining: process.burst,
    responseTime: null,
    completionTime: null,
  }))
}

export function calculateMetrics(processes, timeline) {
  if (processes.length === 0) {
    return {
      rows: [],
      metrics: {
        averageWaitingTime: '0.00',
        averageTurnaroundTime: '0.00',
        averageResponseTime: '0.00',
        cpuUtilization: '0.00',
        throughput: '0.00',
        totalTime: 0,
      },
    }
  }

  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0
  const rows = processes.map((process) => {
    const segments = timeline.filter((segment) => segment.id === process.uid)
    const firstStart = segments.length > 0 ? segments[0].start : 0
    const completionTime = segments.length > 0 ? segments[segments.length - 1].end : 0
    const turnaroundTime = completionTime - process.arrival
    const waitingTime = turnaroundTime - process.burst
    const responseTime = firstStart - process.arrival

    return {
      ...process,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    }
  })

  const busyTime = timeline.reduce(
    (total, segment) => total + (segment.idle ? 0 : segment.end - segment.start),
    0,
  )
  const sum = (field) => rows.reduce((total, process) => total + process[field], 0)
  const average = (field) => (sum(field) / rows.length).toFixed(2)

  return {
    rows,
    metrics: {
      averageWaitingTime: average('waitingTime'),
      averageTurnaroundTime: average('turnaroundTime'),
      averageResponseTime: average('responseTime'),
      cpuUtilization: totalTime > 0 ? ((busyTime / totalTime) * 100).toFixed(2) : '0.00',
      throughput: totalTime > 0 ? (rows.length / totalTime).toFixed(2) : '0.00',
      totalTime,
    },
  }
}

export function scheduleFCFS(processes) {
  const ready = [...processes].sort((a, b) => a.arrival - b.arrival || a.order - b.order)
  const timeline = []
  let currentTime = 0

  ready.forEach((process) => {
    if (currentTime < process.arrival) {
      addIdleSegment(timeline, currentTime, process.arrival)
      currentTime = process.arrival
    }

    const start = currentTime
    const end = start + process.burst
    pushSegment(timeline, createSegment(process, start, end))
    currentTime = end
  })

  return { timeline, ...calculateMetrics(processes, timeline) }
}

export function scheduleSJF(processes) {
  const waiting = [...processes]
  const timeline = []
  let currentTime = 0

  while (waiting.length > 0) {
    const available = waiting.filter((process) => process.arrival <= currentTime)

    if (available.length === 0) {
      const nextArrival = Math.min(...waiting.map((process) => process.arrival))
      addIdleSegment(timeline, currentTime, nextArrival)
      currentTime = nextArrival
      continue
    }

    available.sort(
      (a, b) => a.burst - b.burst || a.arrival - b.arrival || a.order - b.order,
    )

    const process = available[0]
    waiting.splice(waiting.indexOf(process), 1)

    const start = currentTime
    const end = start + process.burst
    pushSegment(timeline, createSegment(process, start, end))
    currentTime = end
  }

  return { timeline, ...calculateMetrics(processes, timeline) }
}

export function schedulePriority(processes) {
  const waiting = [...processes]
  const timeline = []
  let currentTime = 0

  while (waiting.length > 0) {
    const available = waiting.filter((process) => process.arrival <= currentTime)

    if (available.length === 0) {
      const nextArrival = Math.min(...waiting.map((process) => process.arrival))
      addIdleSegment(timeline, currentTime, nextArrival)
      currentTime = nextArrival
      continue
    }

    available.sort(
      (a, b) => a.priority - b.priority || a.arrival - b.arrival || a.order - b.order,
    )

    const process = available[0]
    waiting.splice(waiting.indexOf(process), 1)

    const start = currentTime
    const end = start + process.burst
    pushSegment(timeline, createSegment(process, start, end))
    currentTime = end
  }

  return { timeline, ...calculateMetrics(processes, timeline) }
}

export function scheduleSRTF(processes) {
  const ready = cloneReady(processes)
  const timeline = []
  let currentTime = 0
  let completed = 0

  while (completed < ready.length) {
    const available = ready.filter(
      (process) => process.arrival <= currentTime && process.remaining > 0,
    )

    if (available.length === 0) {
      const future = ready.filter((process) => process.remaining > 0)
      const nextArrival = Math.min(...future.map((process) => process.arrival))
      addIdleSegment(timeline, currentTime, nextArrival)
      currentTime = nextArrival
      continue
    }

    available.sort(
      (a, b) => a.remaining - b.remaining || a.arrival - b.arrival || a.order - b.order,
    )

    const process = available[0]
    const start = currentTime
    const end = start + 1

    pushSegment(timeline, createSegment(process, start, end))
    process.remaining -= 1
    currentTime = end

    if (process.remaining === 0) {
      process.completionTime = currentTime
      completed += 1
    }
  }

  return { timeline, ...calculateMetrics(processes, timeline) }
}
