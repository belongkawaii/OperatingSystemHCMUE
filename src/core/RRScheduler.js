import { Scheduler } from "./abstractions/Scheduler";

export class RRScheduler extends Scheduler {
    constructor(processes, quantum) {
        super(processes);
        this.quantum = quantum;
        this._quantumLeft = 0;
    }

    processIo() {
        const originalRunningProcess = this._runningProcess;
        if (this._runningProcess && this._quantumLeft === 0) {
            this._runningProcess = null;
        }
        super.processIo();
        if (originalRunningProcess && !this._runningProcess && this._quantumLeft === 0) {
            this._runningProcess = originalRunningProcess;
        }
    }

    dispatch() {
        // 1. If there is a running process whose quantum has expired, preempt it
        if (this._runningProcess && this._quantumLeft === 0) {
            this._readyQueue.push(this._runningProcess);
            this._runningProcess = null;
        }

        // 2. If no process is currently running, dispatch the next one.
        // If the process to be dispatched has already executed up to its ioStartTime,
        // it transitions to the IO queue immediately instead of running on the CPU.
        while (!this._runningProcess && this._readyQueue.length > 0) {
            const nextP = this._readyQueue[0];
            const elapsedCpu = nextP.burstTime - nextP.remainingCpu;
            if (nextP.ioStartTime !== null && nextP.ioStartTime !== undefined && nextP.ioStartTime >= 0 && !nextP.hasDoneIo && elapsedCpu === nextP.ioStartTime) {
                const p = this._readyQueue.shift();
                if (!this._runningIoProcess) {
                    this._runningIoProcess = p;
                } else {
                    this._ioQueue.push(p);
                }
            } else {
                this._runningProcess = this._readyQueue.shift();
                this._quantumLeft = this.quantum;
            }
        }
    }

    executeStep() {
        super.executeStep();
        if (this._runningProcess) {
            this._quantumLeft--;
        }
    }
}