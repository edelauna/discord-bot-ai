class RunnerAlreadyStartedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RunnerAlreadyStartedError';
    }
}
class RunnerAlreadyFinishedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RunnerAlreadyFinishedError';
    }
}
export { RunnerAlreadyStartedError, RunnerAlreadyFinishedError };
