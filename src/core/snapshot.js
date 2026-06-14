export class Snapshot {
    constructor(currentTime, processes, runningIoProcessId = null) {
        this.currentTime = currentTime;
        this.processes = processes;
        this.runningIoProcessId = runningIoProcessId;
    }
    isFinished() {
        for (let p of this.processes)
            if (!p.isCompleted())
                return false;
        return true;
    }
}