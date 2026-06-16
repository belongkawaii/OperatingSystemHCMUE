import { describe, it, expect } from "vitest";
import { Process } from "./Process";
import { RRScheduler } from "./RRScheduler";

describe("RRScheduler", () => {
    it("should schedule processes in Round Robin order with time quantum", () => {
        // A arrives at 0, burst 4
        // B arrives at 0, burst 2
        // Quantum = 2
        const pA = new Process("A", 0, 4, null, 0, 4, 0);
        const pB = new Process("B", 0, 2, null, 0, 2, 0);

        const scheduler = new RRScheduler([pA, pB], 2);

        // Step 0: t = 0
        const snap0 = scheduler.nextStep();
        expect(snap0.currentTime).toBe(0);
        expect(snap0.processes.find(p => p.id === "A").stateHistory[0]).toBe("RUNNING");
        expect(snap0.processes.find(p => p.id === "B").stateHistory[0]).toBe("READY");

        // Step 1: t = 1
        const snap1 = scheduler.nextStep();
        expect(snap1.currentTime).toBe(1);
        expect(snap1.processes.find(p => p.id === "A").stateHistory[1]).toBe("RUNNING");
        expect(snap1.processes.find(p => p.id === "B").stateHistory[1]).toBe("READY");

        // Step 2: t = 2 (A is preempted, B starts running)
        const snap2 = scheduler.nextStep();
        expect(snap2.currentTime).toBe(2);
        expect(snap2.processes.find(p => p.id === "A").stateHistory[2]).toBe("READY");
        expect(snap2.processes.find(p => p.id === "B").stateHistory[2]).toBe("RUNNING");

        // Step 3: t = 3
        const snap3 = scheduler.nextStep();
        expect(snap3.currentTime).toBe(3);
        expect(snap3.processes.find(p => p.id === "A").stateHistory[3]).toBe("READY");
        expect(snap3.processes.find(p => p.id === "B").stateHistory[3]).toBe("RUNNING");

        // Step 4: t = 4 (B finishes, A starts running again)
        const snap4 = scheduler.nextStep();
        expect(snap4.currentTime).toBe(4);
        expect(snap4.processes.find(p => p.id === "A").stateHistory[4]).toBe("RUNNING");
        expect(snap4.processes.find(p => p.id === "B").stateHistory[4]).toBe("COMPLETED");

        // Step 5: t = 5
        const snap5 = scheduler.nextStep();
        expect(snap5.currentTime).toBe(5);
        expect(snap5.processes.find(p => p.id === "A").stateHistory[5]).toBe("RUNNING");
        expect(snap5.processes.find(p => p.id === "B").stateHistory[5]).toBe("COMPLETED");

        // Step 6: t = 6 (A finishes)
        const snap6 = scheduler.nextStep();
        expect(snap6.currentTime).toBe(6);
        expect(snap6.processes.find(p => p.id === "A").stateHistory[6]).toBe("COMPLETED");
        expect(snap6.processes.find(p => p.id === "B").stateHistory[6]).toBe("COMPLETED");
        expect(snap6.isFinished()).toBe(true);
    });

    it("should handle process I/O block and reset quantum on dispatch", () => {
        // A arrives at 0, burst 4, ioStartTime = 1, ioTime = 2, remainingIo = 2
        // B arrives at 1, burst 2, ioStartTime = null
        // Quantum = 2
        const pA = new Process("A", 0, 4, 1, 2, 4, 2);
        const pB = new Process("B", 1, 2, null, 0, 2, 0);

        const scheduler = new RRScheduler([pA, pB], 2);

        // Step 0: t = 0
        // A runs
        const snap0 = scheduler.nextStep();
        expect(snap0.processes.find(p => p.id === "A").stateHistory[0]).toBe("RUNNING");
        expect(snap0.processes.find(p => p.id === "B").stateHistory[0]).toBe("NOT_ARRIVED");

        // Step 1: t = 1
        // B arrives. A requests IO (runs for 1 step, ioStartTime = 1).
        // A goes to IO. B is dispatched.
        const snap1 = scheduler.nextStep();
        expect(snap1.processes.find(p => p.id === "A").stateHistory[1]).toBe("IO");
        expect(snap1.processes.find(p => p.id === "B").stateHistory[1]).toBe("RUNNING");

        // Step 2: t = 2
        // B continues running. A is still in IO.
        const snap2 = scheduler.nextStep();
        expect(snap2.processes.find(p => p.id === "A").stateHistory[2]).toBe("IO");
        expect(snap2.processes.find(p => p.id === "B").stateHistory[2]).toBe("RUNNING");

        // Step 3: t = 3
        // B finished at the end of t=2 (runs for 2 steps).
        // A finishes IO and goes to ready queue, then is dispatched.
        const snap3 = scheduler.nextStep();
        expect(snap3.processes.find(p => p.id === "A").stateHistory[3]).toBe("RUNNING");
        expect(snap3.processes.find(p => p.id === "B").stateHistory[3]).toBe("COMPLETED");

        // Step 4: t = 4
        // A continues running.
        const snap4 = scheduler.nextStep();
        expect(snap4.processes.find(p => p.id === "A").stateHistory[4]).toBe("RUNNING");

        // Step 5: t = 5
        // Quantum for A (dispatched at t=3) expires (run for t=3, t=4).
        // A is preempted, but since readyQueue is empty, it runs again.
        const snap5 = scheduler.nextStep();
        expect(snap5.processes.find(p => p.id === "A").stateHistory[5]).toBe("RUNNING");

        // Step 6: t = 6
        // A completes (4 CPU bursts: t=0, t=3, t=4, t=5).
        const snap6 = scheduler.nextStep();
        expect(snap6.processes.find(p => p.id === "A").stateHistory[6]).toBe("COMPLETED");
        expect(snap6.isFinished()).toBe(true);
    });

    it("should NOT transition a process to IO queue if ioTime is 0, even if ioStartTime is 0", () => {
        const pA = new Process("A", 0, 3, 0, 0, 3, 0);
        const scheduler = new RRScheduler([pA], 2);

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
