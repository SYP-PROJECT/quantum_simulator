declare global {
    interface Window {
        gtag: (...args: Gtag.GtagCommands[]) => void;
    }
}

declare namespace Gtag {
    type GtagCommands =
        | ['js', Date]
        | ['config', string, Record<string, unknown>?]
        | ['event', string, Record<string, unknown>?];
}