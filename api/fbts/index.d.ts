interface Window {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
  mozRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  oRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  msRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  mozCancelAnimationFrame: (handle: number) => void;
  oCancelAnimationFrame: (handle: number) => void;
  msCancelAnimationFrame: (handle: number) => void;
}

interface Global {
  window: Window;
}

// @ts-ignore
declare const global: Global;
