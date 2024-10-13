// Based on @angular/cdk/testing
import { EventEmitter, NgZone } from '@angular/core';

export function dispatchEvent(node: Node | Window, event: Event): void {
  node.dispatchEvent(event);
}

export function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): void {
  dispatchEvent(node, createFakeEvent(type, canBubble));
}

export function createFakeEvent(type: string, canBubble = false, cancelable = true): Event {
  return new Event(type, { bubbles: canBubble, cancelable });
}

export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number): void {
  dispatchEvent(node, createKeyboardEvent(type, keyCode));
}

export function createKeyboardEvent(type: string, keyCode: number, key?: string): KeyboardEvent {
  return new KeyboardEvent(type, { keyCode, key, view: window, location: 0, bubbles: true, cancelable: true });
}

export function dispatchMouseEvent(node: Node, type: string, event = createMouseEvent(type, 0, 0)): void {
  dispatchEvent(node, event);
}

/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(type: string, x = 0, y = 0, button = 0): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 0,
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button,
    buttons: 1,
    relatedTarget: null
  });
}

export class MockNgZone extends NgZone {
  public override onStable = new EventEmitter<boolean | null>(false);
  constructor() {
    super({ enableLongStackTrace: false });
  }
  public override run<T>(fn: () => T): T {
    return fn();
  }
  public override runOutsideAngular<T>(fn: () => T): T {
    return fn();
  }
  public simulateZoneExit(): void {
    this.onStable.emit(null);
  }
}
