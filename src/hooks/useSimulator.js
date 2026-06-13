import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Process } from "../core/Process";
import { FCFSScheduler } from "../core/FCFSScheduler";
import { RRScheduler } from "../core/RRScheduler";

const PLAY_INTERVAL = 800;

/* ===========================
   RANDOM PROCESS GENERATOR
=========================== */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PROCESS_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#6C5CE7",
  "#FF8ED4", "#00CEC9", "#0984E3", "#D63031", "#E84393",
  "#A8E6CF", "#DCEDC1", "#FFAAA5", "#FF8B94", "#1E2761"
];

function createRandomProcess(id) {
  const arrivalTime = randomInt(0, 5);

  const burstTime = randomInt(3, 10);

  const useIo = Math.random() > 0.3;

  const ioStartTime = useIo
    ? randomInt(1, Math.max(1, burstTime - 1))
    : null;

  const ioTime = useIo
    ? randomInt(1, 4)
    : 0;

  const colorIndex = (id - 1) % PROCESS_COLORS.length;
  const color = PROCESS_COLORS[colorIndex];

  return {
    id: `P${id}`,
    color,
    arrivalTime,
    burstTime,
    priority: 0,
    ioStartTime,
    ioTime,
  };
}

/* ===========================
   HOOK
=========================== */

export default function useSimulator() {
  const timerRef = useRef(null);

  /* ===========================
     PROCESS TABLE DATA
  =========================== */

  const [processes, setProcesses] = useState(() => {
    return [
      createRandomProcess(1),
      createRandomProcess(2),
      createRandomProcess(3),
      createRandomProcess(4),
    ];
  });

  /* ===========================
     SETTINGS
  =========================== */

  const [algorithm, setAlgorithm] = useState("FCFS");

  const [quantum, setQuantum] = useState(2);

  const [stepMode, setStepMode] = useState(false);

  /* ===========================
     SIMULATION DATA
  =========================== */

  const [snapshots, setSnapshots] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [currentStep, setCurrentStep] = useState(-1);

  const [running, setRunning] = useState(false);

  const [finished, setFinished] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);

  /* ===========================
     BUILD CORE PROCESS
  =========================== */

  const buildProcesses = useCallback(() => {
    return processes.map((p) => {
      return new Process(
        p.id,
        Number(p.arrivalTime),
        Number(p.burstTime),
        p.ioStartTime === "" ? null : Number(p.ioStartTime),
        Number(p.ioTime),
        Number(p.burstTime),
        Number(p.ioTime)
      );
    });
  }, [processes]);

  /* ===========================
     BUILD SCHEDULER
  =========================== */

  const buildScheduler = useCallback(() => {
    const coreProcesses = buildProcesses();

    if (algorithm === "RR") {
      return new RRScheduler(coreProcesses, Number(quantum));
    }

    return new FCFSScheduler(coreProcesses);
  }, [algorithm, quantum, buildProcesses]);

  /* ===========================
     GENERATE ALL SNAPSHOTS
  =========================== */

  const generateSnapshotsAndBlocks = useCallback(() => {
    const scheduler = buildScheduler();
    const resultSnapshots = [];

    while (true) {
      const snapshot = scheduler.nextStep();
      resultSnapshots.push(snapshot);
      if (snapshot.isFinished()) {
        break;
      }
    }

    const resultBlocks = [];
    let currentBlock = null;

    for (let t = 0; t < resultSnapshots.length; t++) {
      const snap = resultSnapshots[t];
      const runningProcess = snap.processes.find(p => p.stateHistory[t] === "RUNNING");

      if (runningProcess) {
        if (!currentBlock || currentBlock.id !== runningProcess.id) {
          if (currentBlock) {
            currentBlock.end = t;
            resultBlocks.push(currentBlock);
          }
          currentBlock = {
            id: runningProcess.id,
            start: t,
            end: t + 1
          };
        } else {
          currentBlock.end = t + 1;
        }
      } else {
        if (currentBlock) {
          currentBlock.end = t;
          resultBlocks.push(currentBlock);
          currentBlock = null;
        }
      }
    }

    if (currentBlock) {
      resultBlocks.push(currentBlock);
    }

    return { resultSnapshots, resultBlocks };
  }, [buildScheduler]);

  /* ===========================
     RESET
  =========================== */

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setRunning(false);
    setFinished(false);
    setCurrentStep(-1);
    setSnapshots([]);
    setBlocks([]);
    setHasStarted(false);
  }, []);

  /* ===========================
     START / RESUME
  =========================== */

  const start = useCallback(() => {
    let localBlocks = blocks;

    if (snapshots.length === 0) {
      const { resultSnapshots, resultBlocks } = generateSnapshotsAndBlocks();
      setSnapshots(resultSnapshots);
      setBlocks(resultBlocks);
      localBlocks = resultBlocks;
    }

    setHasStarted(true);

    /* STEP MODE */
    if (stepMode) {
      setFinished(false);

      setCurrentStep((prev) => {
        const next = prev + 1;

        if (next >= localBlocks.length - 1) {
          setFinished(true);
          return localBlocks.length - 1;
        }

        return next;
      });

      return;
    }

    /* NORMAL MODE */

    setRunning(true);
  }, [snapshots, blocks, generateSnapshotsAndBlocks, stepMode]);

  /* ===========================
     PAUSE
  =========================== */

  const pause = useCallback(() => {
    setRunning(false);
  }, []);

  /* ===========================
     SKIP STEP
  =========================== */

  const skipStep = useCallback(() => {
    if (!stepMode) return;

    setCurrentStep((prev) => {
      const next = prev + 1;

      if (next >= blocks.length - 1) {
        setFinished(true);
        return blocks.length - 1;
      }

      return next;
    });
  }, [stepMode, blocks]);

  /* ===========================
     AUTO PLAY
  =========================== */

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;

        if (next >= blocks.length - 1) {
          clearInterval(timerRef.current);

          setRunning(false);
          setFinished(true);

          return blocks.length - 1;
        }

        return next;
      });
    }, PLAY_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [running, blocks]);

  /* ===========================
     CURRENT SNAPSHOT
  =========================== */

  const currentSnapshot = useMemo(() => {
    if (currentStep < 0) return null;

    return snapshots[currentStep] ?? null;
  }, [snapshots, currentStep]);

  /* ===========================
     PROCESS CRUD
  =========================== */

  const addProcess = useCallback(() => {
    const usedIds = processes.map((p) =>
      Number(p.id.replace("P", ""))
    );

    let nextId = 1;

    while (usedIds.includes(nextId)) {
      nextId++;
    }

    setProcesses((prev) => [
      ...prev,
      createRandomProcess(nextId),
    ]);
  }, [processes]);

  const deleteProcess = useCallback((pid) => {
    const filtered = processes.filter(
      (p) => p.id !== pid
    );

    const normalized = filtered.map((p, index) => ({
      ...p,
      id: `P${index + 1}`,
    }));

    setProcesses(normalized);
  }, [processes]);

  const updateProcess = useCallback(
    (pid, field, value) => {
      setProcesses((prev) =>
        prev.map((p) =>
          p.id === pid
            ? {
                ...p,
                [field]: value,
              }
            : p
        )
      );
    },
    []
  );

  /* ===========================
     BUTTON STATES
  =========================== */

  const canStart = useMemo(() => {
    if (!stepMode) {
      return !running;
    }

    if (!hasStarted) return true;

    return finished;
  }, [running, stepMode, finished, hasStarted]);

  const canPause = useMemo(() => {
    if (stepMode) return false;

    return running;
  }, [running, stepMode]);

  const canSkip = useMemo(() => {
    if (!stepMode) return false;

    if (!hasStarted) return false;

    if (finished) return false;

    return true;
  }, [stepMode, hasStarted, finished]);

  /* ===========================
     PROGRESS
  =========================== */

  const progress = useMemo(() => {
    if (blocks.length === 0) {
      return "0/0";
    }

    return `${Math.max(0, currentStep + 1)}/${blocks.length}`;
  }, [currentStep, blocks]);

  /* ===========================
     EXPORT
  =========================== */

  return {
    processes,
    setProcesses,

    algorithm,
    setAlgorithm,

    quantum,
    setQuantum,

    stepMode,
    setStepMode,

    snapshots,
    blocks,
    currentSnapshot,

    currentStep,

    running,
    finished,

    progress,

    start,
    pause,
    reset,
    skipStep,

    addProcess,
    deleteProcess,
    updateProcess,

    canStart,
    canPause,
    canSkip,
    hasStarted,
  };
}