import { Scheduler } from "./abstractions/Scheduler";

export class FCFSScheduler extends Scheduler {
    dispatch() {
        if (!this._runningProcess && this._readyQueue.length > 0) {
            this._runningProcess = this._readyQueue.shift();
        }
    }
}
