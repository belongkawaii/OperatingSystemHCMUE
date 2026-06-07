import { Scheduler } from "./abstractions/Scheduler";

export class RRScheduler extends Scheduler {

  constructor(
    processes,
    quantum = 2
  ) {
    super(processes);

    this.quantum = quantum;

    this.quantumCounter = 0;
  }

  dispatch() {

    if (
      !this._runningProcess &&
      this._readyQueue.length > 0
    ) {

      this._runningProcess =
        this._readyQueue.shift();

      this.quantumCounter = 0;
    }
  }

  executeStep() {

    if (
      this._runningProcess
    ) {

      this._runningProcess.tickCpu();

      this.quantumCounter++;

      if (
        !this._runningProcess.isCompleted() &&
        this.quantumCounter >=
          this.quantum
      ) {

        const executed =
          this._runningProcess
            .burstTime -
          this._runningProcess
            .remainingCpu;

        const needIo =
          !this
            ._runningProcess
            .hasDoneIo &&
          executed ===
            this
              ._runningProcess
              .ioStartTime;

        if (!needIo) {

          this._readyQueue.push(
            this._runningProcess
          );

          this._runningProcess =
            null;

          this.quantumCounter = 0;
        }
      }
    }

    if (
      this._runningIoProcess
    ) {
      this._runningIoProcess.tickIo();
    }
  }
}