// Based on @angular/cdk/testing
import { EventEmitter, NgZone } from '@angular/core';

export type KeyDownEventType = 'keydown' | 'keyup' | 'keypress';

export function dispatchEvent<T extends Event>(node: Node | Window, event: T): T {
  node.dispatchEvent(event);
  return event;
}

export function dispatchFakeEvent(
  node: Node | Window,
  type: string,
  canBubble?: boolean
): Event {
  return dispatchEvent(node, createFakeEvent(type, canBubble));
}

export function createFakeEvent(
  type: string,
  canBubble = false,
  cancelable = true
): Event {
  return new Event(type, { bubbles: canBubble, cancelable });
}

export function dispatchKeyboardEvent(
  node: Node,
  type: KeyDownEventType,
  keyCode: number
): KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode));
}

export function createKeyboardEvent(
  type: KeyDownEventType,
  keyCode: number,
  key?: string
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    keyCode,
    code: key,
    which: keyCode
  });
}

export function dispatchMouseEvent(
  node: Node,
  type: string,
  x = 0,
  y = 0,
  event = createMouseEvent(type, x, y)
): MouseEvent {
  return dispatchEvent(node, event) as MouseEvent;
}

/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(
  type: string,
  x = 0,
  y = 0,
  button = 0
): MouseEvent {
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
    relatedTarget: null,
    buttons: 1
  });
}

export class MockNgZone extends NgZone {
  public override onStable = new EventEmitter<unknown>(false);

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

export const MONTHS = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
} as const;
