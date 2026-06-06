import { Snapshot } from "../snapshot";

export class Scheduler {
    constructor(processes) {
        if (new.target === Scheduler)
            throw new Error("Scheduler is abstract and can't be instantiated.")

        this._processes = processes;
        this._readyQueue = [];
        this._ioQueue = [];
        this._currentTime = 0;
        this._runningProcess = null;
        this._runningIoProcess = null;
    }

    nextStep() {
        // 1. Remove completed running process from CPU
        if (this._runningProcess && this._runningProcess.isCompleted()) {
            this._runningProcess = null;
        }

        // 2. Check for newly arriving processes
        this.checkArrivals();

        // 3. Process I/O queue and transitions
        this.processIo();

        // 4. Dispatch CPU to schedule the next process
        this.dispatch();

        // 5. Record the states of all processes for the current time step
        this.recordStates();

        // 6. Create a snapshot of the current state (cloning processes to preserve history)
        const snapshot = new Snapshot(this._currentTime, this.cloneProcesses());

        // 7. Tick CPU and I/O processes for this time step
        this.executeStep();

        // 8. Increment simulation time
        this._currentTime++;

        return snapshot;
    }

    checkArrivals() {
        for (const p of this._processes) {
            if (p.arrivalTime === this._currentTime) {
                this._readyQueue.push(p);
            }
        }
    }

    processIo() {
        // Only the currently running process can execute and initiate an IO request
        if (this._runningProcess && !this._runningProcess.hasDoneIo) {
            const p = this._runningProcess;
            if (p.ioStartTime !== null && p.ioStartTime !== undefined && p.ioStartTime >= 0) {
                const elapsedCpu = p.burstTime - p.remainingCpu;
                // Transition to IO queue if the CPU time it has executed matches its ioStartTime
                // or if the global simulation time matches its ioStartTime.
                if (elapsedCpu === p.ioStartTime || this._currentTime === p.ioStartTime) {
                    this._runningProcess = null;
                    this._ioQueue.push(p);
                }
            }
        }

        // If the current running IO process has finished its IO duration, return it to the ready queue
        if (this._runningIoProcess && this._runningIoProcess.remainingIo === 0) {
            this._readyQueue.push(this._runningIoProcess);
            this._runningIoProcess = null;
        }

        // If no process is currently running IO, start the next one in the queue
        if (!this._runningIoProcess && this._ioQueue.length > 0) {
            this._runningIoProcess = this._ioQueue.shift();
        }
    }

    dispatch() {
        throw new Error("dispatch() must be implemented by subclass.")
    }

    recordStates() {
        for (const p of this._processes) {
            if (p.isCompleted()) {
                p.recordState("COMPLETED");
            } else if (p === this._runningProcess) {
                p.recordState("RUNNING");
            } else if (p === this._runningIoProcess || this._ioQueue.includes(p)) {
                p.recordState("IO");
            } else if (this._readyQueue.includes(p)) {
                p.recordState("READY");
            } else {
                p.recordState("NOT_ARRIVED");
            }
        }
    }

    executeStep() {
        if (this._runningProcess) {
            this._runningProcess.tickCpu();
        }
        if (this._runningIoProcess) {
            this._runningIoProcess.tickIo();
        }
    }

    cloneProcesses() {
        return this._processes.map(p => p.clone());
    }
}