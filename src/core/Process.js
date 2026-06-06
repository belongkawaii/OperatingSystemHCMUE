export class Process {
    constructor(
        id,
        arrivalTime,
        burstTime,
        ioStartTime,
        ioTime,
        remainingCpu,
        remainingIo,
    ) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.ioStartTime = ioStartTime;
        this.ioTime = ioTime;
        this.remainingCpu = remainingCpu;
        this.remainingIo = remainingIo;
        this.stateHistory = [];
        this.hasDoneIo = false;
    }

    tickCpu() {
        if (this.remainingCpu > 0)
            --this.remainingCpu;
    }
    tickIo() {
        if (this.remainingIo > 0)
            --this.remainingIo;
        if (this.remainingIo == 0)
            this.hasDoneIo = true;
    }
    recordState(state) {
        this.stateHistory.push(state);
    }
    isCompleted() {
        return this.remainingCpu == 0;
    }
}