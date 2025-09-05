export type FinaSyncStatus = {
    running: boolean;
    startedAt?: string;
    finishedAt?: string;
    progress?: number;
    stage?: string;
    message?: string;
};