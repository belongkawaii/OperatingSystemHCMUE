import { calculateMetrics } from './FCFSScheduler'

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

export function scheduleRR(processes, quantum) {
  const ready = processes
    .map((process) => ({ ...process, remaining: process.burst }))
    .sort((a, b) => a.arrival - b.arrival || a.order - b.order)
  const queue = []
  const timeline = []
  const timeQuantum = Math.max(1, Number(quantum) || 1)
  let currentTime = 0
  let nextIndex = 0
  let completed = 0

  const enqueueArrived = () => {
    while (nextIndex < ready.length && ready[nextIndex].arrival <= currentTime) {
      queue.push(ready[nextIndex])
      nextIndex += 1
    }
  }

  while (completed < ready.length) {
    enqueueArrived()

    if (queue.length === 0) {
      const nextArrival = ready[nextIndex]?.arrival ?? currentTime
      addIdleSegment(timeline, currentTime, nextArrival)
      currentTime = nextArrival
      enqueueArrived()
      continue
    }

    const process = queue.shift()
    const start = currentTime
    const duration = Math.min(timeQuantum, process.remaining)
    const end = start + duration

    pushSegment(timeline, createSegment(process, start, end))
    process.remaining -= duration
    currentTime = end
    enqueueArrived()

    if (process.remaining > 0) {
      queue.push(process)
    } else {
      completed += 1
    }
  }

  return { timeline, ...calculateMetrics(processes, timeline) }
}
