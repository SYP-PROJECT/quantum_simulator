declare namespace Gtag {
    type GtagCommands =
        | ['js', Date]
        | ['config', string, Record<string, unknown>?]
        | ['event', string, Record<string, unknown>?];
}

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
    }
}

export {};