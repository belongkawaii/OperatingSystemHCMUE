export class Snapshot {
    constructor(currentTime, processes) {
        this.currentTime = currentTime;
        this.processes = processes;
    }
    isFinished() {
        for (let p of this.processes)
            if (!p.isCompleted())
                return false;
    }
}