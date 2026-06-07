export class Snapshot {
  constructor(
    currentTime,
    processes
  ) {
    this.currentTime =
      currentTime;

    this.processes =
      processes;
  }

  isFinished() {

    return this.processes.every(
      p => p.isCompleted()
    );
  }
}