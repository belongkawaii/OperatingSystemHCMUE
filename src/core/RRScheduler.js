import { Scheduler } from "./abstractions/Scheduler";

export class RRScheduler extends Scheduler {
    constructor(processes, quantum) {
        super(processes);
        this.quantum = quantum;
        this._quantumLeft = 0;
    }

    dispatch() {
        // 1. If there is a running process whose quantum has expired, preempt it
        if (this._runningProcess && this._quantumLeft === 0) {
            this._readyQueue.push(this._runningProcess);
            this._runningProcess = null;
        }

        // 2. If no process is currently running, dispatch the next one
        if (!this._runningProcess && this._readyQueue.length > 0) {
            this._runningProcess = this._readyQueue.shift();
            this._quantumLeft = this.quantum;
        }
    }

    executeStep() {
        super.executeStep();
        if (this._runningProcess) {
            this._quantumLeft--;
        }
    }
}