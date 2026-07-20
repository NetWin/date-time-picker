// Based on @angular/cdk/testing
import { EventEmitter, NgZone } from '@angular/core';

export function dispatchEvent<T extends Event>(node: Node | Window, event: T): T {
  node.dispatchEvent(event);
  return event;
}

export function dispatchFakeEvent(node: Node | Window, type: string): Event {
  return dispatchEvent(node, createFakeEvent(type));
}

export function createFakeEvent(type: string): Event {
  return new Event(type, { bubbles: false, cancelable: true });
}

export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number): KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode));
}

export function createKeyboardEvent(type: string, keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true });

  // The `keyCode` property is not settable through the constructor's init dictionary,
  // so it is defined explicitly here. `key` and `target` are overridden to match the
  // behaviour the tests rely on.
  Object.defineProperties(event, {
    keyCode: { get: () => keyCode },
    key: { get: () => undefined },
    target: { get: () => undefined }
  });

  return event;
}

export function dispatchMouseEvent(node: Node, type: string): MouseEvent {
  return dispatchEvent(node, createMouseEvent(type, 0, 0)) as MouseEvent;
}

/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(type: string, x = 0, y = 0, button = 0): MouseEvent {
  // `buttons` is set to 1 because a value of 0 looks like a fake event.
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: false,
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
