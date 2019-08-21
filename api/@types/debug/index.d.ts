// Blatantly copied from @types/debug
// I added a line tho

declare var debug: debug.Debug & { debug: debug.Debug; default: debug.Debug };

export default debug;
export as namespace debug;

declare namespace debug {
  interface Debug {
    (namespace: string): Debugger;
    coerce: (val: any) => any;
    disable: () => string;
    enable: (namespaces: string) => void;
    enabled: (namespaces: string) => boolean;
    log: (...args: any[]) => any;

    // Blatantly copied from @types/ms
    // I didn't even add a line here
    // Except for these three :)
    humanize: (value: number, options?: { long: boolean }) => string;

    names: RegExp[];
    skips: RegExp[];

    formatters: Formatters;
  }

  type IDebug = Debug;

  interface Formatters {
    [formatter: string]: (v: any) => string;
  }

  type IDebugger = Debugger;

  interface Debugger {
    (formatter: any, ...args: any[]): void;

    color: string;
    enabled: boolean;
    log: (...args: any[]) => any;
    namespace: string;
    destroy: () => boolean;
    extend: (namespace: string, delimiter?: string) => Debugger;
  }
}
