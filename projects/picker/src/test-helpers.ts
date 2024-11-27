import { EventEmitter, NgZone } from '@angular/core';

export function dispatchEvent(node: Node | Window, event: Event): Event {
  node.dispatchEvent(event);
  return event;
}

export function dispatchFakeEvent(node: Node | Window, type: string): Event {
  return dispatchEvent(node, createFakeEvent(type));
}

export function createFakeEvent(type: string, canBubble = false, cancelable = true): Event {
  return new Event(type, { bubbles: canBubble, cancelable });
}

export function dispatchKeyboardEvent(node: Node, type: string, key: string): KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, key)) as KeyboardEvent;
}

export function createKeyboardEvent(type: string, key?: string): KeyboardEvent {
  return new KeyboardEvent(type, { bubbles: true, cancelable: true, key });
}

export function dispatchMouseEvent(node: Node, type: string): MouseEvent {
  return dispatchEvent(node, createMouseEvent(type, 0, 0)) as MouseEvent;
}

/**
 *  Creates a browser MouseEvent with the specified options.
 */
export function createMouseEvent(type: string, x = 0, y = 0, button = 0): MouseEvent {
  const event = new MouseEvent(type, {
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
    relatedTarget: null
  });

  return event;
}

export class MockNgZone extends NgZone {
  public override onStable = new EventEmitter<boolean>(false);

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
