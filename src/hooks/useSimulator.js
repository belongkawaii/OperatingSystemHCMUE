import { useMemo, useRef, useState } from 'react'
import {
  scheduleFCFS,
  schedulePriority,
  scheduleSJF,
  scheduleSRTF,
} from '../core/FCFSScheduler'
import { createProcess, DEFAULT_PROCESSES, normalizeProcesses } from '../core/Process'
import { scheduleRR } from '../core/RRScheduler'

const ALGORITHM_OPTIONS = [
  {
    value: 'fcfs',
    label: 'FCFS',
    description: 'Tiến trình đến trước được chạy trước.',
  },
  {
    value: 'sjf',
    label: 'SJF',
    description: 'Chọn tiến trình có burst time ngắn nhất trong hàng đợi.',
  },
  {
    value: 'srtf',
    label: 'SRTF',
    description: 'Ưu tiên tiến trình còn ít thời gian chạy nhất.',
  },
  {
    value: 'priority',
    label: 'Priority',
    description: 'Số ưu tiên nhỏ hơn được chạy trước.',
  },
  {
    value: 'rr',
    label: 'Round Robin',
    description: 'Chia CPU theo lát thời gian quantum.',
  },
]

function runScheduler(processes, algorithm, timeQuantum) {
  const normalizedProcesses = normalizeProcesses(processes)

  switch (algorithm) {
    case 'sjf':
      return scheduleSJF(normalizedProcesses)
    case 'srtf':
      return scheduleSRTF(normalizedProcesses)
    case 'priority':
      return schedulePriority(normalizedProcesses)
    case 'rr':
      return scheduleRR(normalizedProcesses, timeQuantum)
    case 'fcfs':
    default:
      return scheduleFCFS(normalizedProcesses)
  }
}

export function useSimulator() {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES)
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [timeQuantum, setTimeQuantum] = useState(2)
  const nextProcessIndex = useRef(DEFAULT_PROCESSES.length + 1)

  const simulation = useMemo(
    () => runScheduler(processes, algorithm, timeQuantum),
    [algorithm, processes, timeQuantum],
  )

  const addProcess = () => {
    const nextProcess = createProcess(nextProcessIndex.current)
    nextProcessIndex.current += 1
    setProcesses((current) => [...current, nextProcess])
  }

  const updateProcess = (uid, field, value) => {
    setProcesses((current) =>
      current.map((process) => {
        if (process.uid !== uid) return process

        if (field === 'id') {
          return { ...process, id: value }
        }

        return { ...process, [field]: value === '' ? '' : Number(value) }
      }),
    )
  }

  const removeProcess = (uid) => {
    setProcesses((current) =>
      current.length === 1 ? current : current.filter((process) => process.uid !== uid),
    )
  }

  const resetProcesses = () => {
    nextProcessIndex.current = DEFAULT_PROCESSES.length + 1
    setProcesses(DEFAULT_PROCESSES)
    setAlgorithm('fcfs')
    setTimeQuantum(2)
  }

  const updateQuantum = (value) => {
    setTimeQuantum(value === '' ? '' : Math.max(1, Number(value)))
  }

  return {
    processes,
    algorithm,
    algorithmOptions: ALGORITHM_OPTIONS,
    timeQuantum,
    simulation,
    addProcess,
    updateProcess,
    removeProcess,
    resetProcesses,
    setAlgorithm,
    setTimeQuantum: updateQuantum,
  }
}
