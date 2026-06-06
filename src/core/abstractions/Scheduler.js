import { Snapshot } from "../snapshot";

export class Scheduler {
    constructor(processes) {
        if (new.target === Scheduler)
            throw new Error("Scheduler is abstract and can't be instantiated.")

        this._processes = processes;
        this._readyQueue = [];
        this._ioQUeue = [];
        this._currentTime = 0;
        this._currentProcess = null;
    }

    nextStep() {
        // processing

        return new Snapshot(this._currentTime, this._processes);
    }

    checkArrivals() {
        // processing
    }

    processIo() {
        // processing
    }

    dispatch() {

    }
}