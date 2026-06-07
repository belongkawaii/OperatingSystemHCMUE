export class Process {
  constructor(
    id,
    arrivalTime,
    burstTime,
    ioStartTime,
    ioTime,
    remainingCpu,
    remainingIo
  ) {
    this.id = id;

    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;

    this.ioStartTime = ioStartTime;
    this.ioTime = ioTime;

    this.remainingCpu = remainingCpu;
    this.remainingIo = remainingIo;

    this.hasDoneIo = false;

    this.stateHistory = [];

    // Statistics

    this.waitingTime = 0;

    this.responseTime = null;

    this.completionTime = null;
  }

  tickCpu() {
    if (this.remainingCpu > 0) {
      this.remainingCpu--;
    }
  }

  tickIo() {
    if (this.remainingIo > 0) {
      this.remainingIo--;
    }

    if (this.remainingIo === 0) {
      this.hasDoneIo = true;
    }
  }

  recordState(state) {
    this.stateHistory.push(state);
  }

  isCompleted() {
    return this.remainingCpu === 0;
  }

  clone() {
    const cloned = new Process(
      this.id,
      this.arrivalTime,
      this.burstTime,
      this.ioStartTime,
      this.ioTime,
      this.remainingCpu,
      this.remainingIo
    );

    cloned.hasDoneIo =
      this.hasDoneIo;

    cloned.stateHistory = [
      ...this.stateHistory,
    ];

    cloned.waitingTime =
      this.waitingTime;

    cloned.responseTime =
      this.responseTime;

    cloned.completionTime =
      this.completionTime;

    return cloned;
  }
}