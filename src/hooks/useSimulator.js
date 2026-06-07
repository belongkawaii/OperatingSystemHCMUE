import { useState, useRef, useEffect } from "react";

import { Process } from "../core/Process";
import { FCFSScheduler } from "../core/FCFSScheduler";
import { RRScheduler } from "../core/RRScheduler";

export default function useSimulator() {

  const [snapshots, setSnapshots] =
    useState([]);

  const [running, setRunning] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [speed, setSpeed] =
    useState(1);

  const schedulerRef =
    useRef(null);

  // ==========================
  // CREATE SCHEDULER
  // ==========================

  const initializeSimulation = (
    algorithm,
    quantum,
    processConfigs
  ) => {

    const processes =
      processConfigs.map(
        (p) =>
          new Process(
            p.id,
            p.arrivalTime,
            p.burstTime,
            p.ioStartTime,
            p.ioTime,
            p.burstTime,
            p.ioTime
          )
      );

    schedulerRef.current =
      algorithm === "RR"
        ? new RRScheduler(
            processes,
            quantum
          )
        : new FCFSScheduler(
            processes
          );

    setSnapshots([]);
    setFinished(false);
    setRunning(false);
  };

  // ==========================
  // NEXT STEP
  // ==========================

  const nextStep = () => {

    if (!schedulerRef.current)
      return;

    if (finished)
      return;

    const snapshot =
      schedulerRef.current.nextStep();

    setSnapshots((prev) => [
      ...prev,
      snapshot,
    ]);

    if (snapshot.isFinished()) {

      setFinished(true);

      setRunning(false);
    }
  };

  // ==========================
  // AUTO RUN
  // ==========================

  useEffect(() => {

    if (!running)
      return;

    const timer =
      setInterval(
        () => {

          nextStep();

        },
        1000 / speed
      );

    return () =>
      clearInterval(timer);

  }, [running, speed]);

  // ==========================
  // RESET
  // ==========================

  const resetSimulation = () => {

    schedulerRef.current =
      null;

    setSnapshots([]);

    setRunning(false);

    setFinished(false);
  };

  return {
    snapshots,

    running,
    setRunning,

    finished,

    speed,
    setSpeed,

    initializeSimulation,

    nextStep,

    resetSimulation,
  };
}