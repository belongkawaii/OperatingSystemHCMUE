import { describe, it, expect } from "vitest";
import { Process } from "./Process";
import { FCFSScheduler } from "./FCFSScheduler";

describe("FCFSScheduler", () => {
    it("should schedule processes in First-Come, First-Served order", () => {
        const pA = new Process("A", 0, 3, null, 0, 3, 0);
        const pB = new Process("B", 1, 2, null, 0, 2, 0);

        const scheduler = new FCFSScheduler([pA, pB]);

        // Step 0: t = 0
        const snap0 = scheduler.nextStep();
        expect(snap0.currentTime).toBe(0);
        // Process A should be running, Process B not arrived
        expect(snap0.processes.find(p => p.id === "A").stateHistory[0]).toBe("RUNNING");
        expect(snap0.processes.find(p => p.id === "B").stateHistory[0]).toBe("NOT_ARRIVED");

        // Step 1: t = 1
        const snap1 = scheduler.nextStep();
        expect(snap1.currentTime).toBe(1);
        // Process A should still be running, Process B should be ready
        expect(snap1.processes.find(p => p.id === "A").stateHistory[1]).toBe("RUNNING");
        expect(snap1.processes.find(p => p.id === "B").stateHistory[1]).toBe("READY");

        // Step 2: t = 2
        const snap2 = scheduler.nextStep();
        expect(snap2.currentTime).toBe(2);
        expect(snap2.processes.find(p => p.id === "A").stateHistory[2]).toBe("RUNNING");
        expect(snap2.processes.find(p => p.id === "B").stateHistory[2]).toBe("READY");

        // Step 3: t = 3
        const snap3 = scheduler.nextStep();
        expect(snap3.currentTime).toBe(3);
        // Process A is completed, Process B is running
        expect(snap3.processes.find(p => p.id === "A").stateHistory[3]).toBe("COMPLETED");
        expect(snap3.processes.find(p => p.id === "B").stateHistory[3]).toBe("RUNNING");

        // Step 4: t = 4
        const snap4 = scheduler.nextStep();
        expect(snap4.currentTime).toBe(4);
        expect(snap4.processes.find(p => p.id === "A").stateHistory[4]).toBe("COMPLETED");
        expect(snap4.processes.find(p => p.id === "B").stateHistory[4]).toBe("RUNNING");

        // Step 5: t = 5
        const snap5 = scheduler.nextStep();
        expect(snap5.currentTime).toBe(5);
        expect(snap5.processes.find(p => p.id === "A").stateHistory[5]).toBe("COMPLETED");
        expect(snap5.processes.find(p => p.id === "B").stateHistory[5]).toBe("COMPLETED");

        expect(snap5.isFinished()).toBe(true);
    });

    it("should handle process I/O block and return to ready queue", () => {
        // Process A: arrives t=0, burstTime=3, ioStartTime=1, ioTime=2.
        // It runs for 1 step, goes to IO for 2 steps, then finishes remaining 2 CPU steps.
        const pA = new Process("A", 0, 3, 1, 2, 3, 2);

        const scheduler = new FCFSScheduler([pA]);

        // Step 0: t = 0 (Runs)
        const snap0 = scheduler.nextStep();
        expect(snap0.processes[0].stateHistory[0]).toBe("RUNNING");
        expect(scheduler._runningProcess).toBe(pA);

        // Step 1: t = 1 (Runs checkArrivals, then processIo: CPU run time of A = 1 which matches ioStartTime=1.
        // A is moved to ioQueue. dispatch sees runningProcess = null, readyQueue = empty.
        // snap1 records A in state IO (since runningIoProcess becomes A).
        // Then executeStep ticks IO, so A remainingIo becomes 1.)
        const snap1 = scheduler.nextStep();
        expect(snap1.processes[0].stateHistory[1]).toBe("IO");
        expect(scheduler._runningProcess).toBeNull();
        expect(scheduler._runningIoProcess).toBe(pA);
        expect(pA.remainingIo).toBe(1);

        // Step 2: t = 2 (Runs checkArrivals. processIo: A is running IO, remainingIo is 1 (not 0).
        // snap2 records A in state IO.
        // Then executeStep ticks IO, so A remainingIo becomes 0.)
        const snap2 = scheduler.nextStep();
        expect(snap2.processes[0].stateHistory[2]).toBe("IO");
        expect(scheduler._runningProcess).toBeNull();
        expect(scheduler._runningIoProcess).toBe(pA);
        expect(pA.remainingIo).toBe(0);

        // Step 3: t = 3 (Runs checkArrivals. processIo: A remainingIo is 0, so it returns A to readyQueue, and runningIoProcess becomes null.
        // dispatch: runningProcess is null, readyQueue has A. runningProcess becomes A.
        // snap3 records A in state RUNNING.
        // executeStep ticks CPU, A remainingCpu becomes 1.)
        const snap3 = scheduler.nextStep();
        expect(snap3.processes[0].stateHistory[3]).toBe("RUNNING");
        expect(scheduler._runningProcess).toBe(pA);
        expect(pA.remainingCpu).toBe(1);

        // Step 4: t = 4 (A runs and finishes)
        const snap4 = scheduler.nextStep();
        expect(snap4.processes[0].stateHistory[4]).toBe("RUNNING");
        expect(pA.remainingCpu).toBe(0);

        // Step 5: t = 5 (A is completed)
        const snap5 = scheduler.nextStep();
        expect(snap5.processes[0].stateHistory[5]).toBe("COMPLETED");
        expect(snap5.isFinished()).toBe(true);
    });

    it("should NOT transition a process to IO queue if ioTime is 0, even if ioStartTime is positive", () => {
        const pA = new Process("A", 0, 3, 1, 0, 3, 0);
        const scheduler = new FCFSScheduler([pA]);

        const snap0 = scheduler.nextStep();
        expect(snap0.processes[0].stateHistory[0]).toBe("RUNNING");
        
        const snap1 = scheduler.nextStep();
        expect(snap1.processes[0].stateHistory[1]).toBe("RUNNING");
        
        const snap2 = scheduler.nextStep();
        expect(snap2.processes[0].stateHistory[2]).toBe("RUNNING");
        
        const snap3 = scheduler.nextStep();
        expect(snap3.processes[0].stateHistory[3]).toBe("COMPLETED");
        expect(snap3.isFinished()).toBe(true);
    });
});
