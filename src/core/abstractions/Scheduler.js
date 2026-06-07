import { Snapshot } from "../snapshot";

export class Scheduler {
  constructor(processes) {
    if (
      new.target === Scheduler
    ) {
      throw new Error(
        "Scheduler is abstract."
      );
    }

    this._processes =
      processes;

    this._readyQueue = [];

    this._ioQueue = [];

    this._runningProcess =
      null;

    this._runningIoProcess =
      null;

    this._currentTime = 0;
  }

  nextStep() {

    // ======================
    // CPU COMPLETE
    // ======================

    if (
      this._runningProcess &&
      this._runningProcess.isCompleted()
    ) {
      this._runningProcess.completionTime =
        this._currentTime;

      this._runningProcess =
        null;
    }

    // ======================
    // ARRIVALS
    // ======================

    this.checkArrivals();

    // ======================
    // IO COMPLETE
    // ======================

    this.checkIoComplete();

    // ======================
    // CPU -> IO
    // ======================

    this.checkIoRequest();

    // ======================
    // START IO
    // ======================

    this.startIo();

    // ======================
    // DISPATCH
    // ======================

    this.dispatch();

    // ======================
    // WAITING TIME
    // ======================

    for (const p of this._readyQueue) {
      p.waitingTime++;
    }

    // ======================
    // RESPONSE TIME
    // ======================

    if (
      this._runningProcess &&
      this._runningProcess
        .responseTime === null
    ) {
      this._runningProcess.responseTime =
        this._currentTime -
        this._runningProcess
          .arrivalTime;
    }

    // ======================
    // RECORD STATE
    // ======================

    this.recordStates();

    const snapshot =
      new Snapshot(
        this._currentTime,
        this.cloneProcesses()
      );

    // ======================
    // EXECUTE
    // ======================

    this.executeStep();

    this._currentTime++;

    return snapshot;
  }

  checkArrivals() {
    for (const p of this._processes) {
      if (
        p.arrivalTime ===
        this._currentTime
      ) {
        this._readyQueue.push(p);
      }
    }
  }

  checkIoComplete() {

    if (
      this._runningIoProcess &&
      this._runningIoProcess
        .remainingIo === 0
    ) {

      this._readyQueue.push(
        this._runningIoProcess
      );

      this._runningIoProcess =
        null;
    }
  }

  checkIoRequest() {

    if (
      !this._runningProcess
    )
      return;

    const p =
      this._runningProcess;

    if (p.hasDoneIo)
      return;

    const executed =
      p.burstTime -
      p.remainingCpu;

    if (
      p.ioStartTime >= 0 &&
      executed ===
        p.ioStartTime
    ) {

      this._ioQueue.push(p);

      this._runningProcess =
        null;
    }
  }

  startIo() {

    if (
      !this._runningIoProcess &&
      this._ioQueue.length > 0
    ) {
      this._runningIoProcess =
        this._ioQueue.shift();
    }
  }

  recordStates() {

    for (const p of this._processes) {

      if (p.isCompleted()) {

        p.recordState(
          "COMPLETED"
        );

      } else if (
        p ===
        this._runningProcess
      ) {

        p.recordState(
          "RUNNING"
        );

      } else if (
        p ===
          this
            ._runningIoProcess ||
        this._ioQueue.includes(
          p
        )
      ) {

        p.recordState("IO");

      } else if (
        this._readyQueue.includes(
          p
        )
      ) {

        p.recordState(
          "READY"
        );

      } else {

        p.recordState(
          "NOT_ARRIVED"
        );
      }
    }
  }

  executeStep() {

    if (
      this._runningProcess
    ) {
      this._runningProcess.tickCpu();
    }

    if (
      this._runningIoProcess
    ) {
      this._runningIoProcess.tickIo();
    }
  }

  cloneProcesses() {

    return this._processes.map(
      p => p.clone()
    );
  }

  dispatch() {
    throw new Error(
      "dispatch() must be implemented."
    );
  }
}