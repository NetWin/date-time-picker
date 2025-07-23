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
  const event = document.createEvent('Event');
  event.initEvent(type, false, true);
  return event;
}

export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number): KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode));
}

export function createKeyboardEvent(type: string, keyCode: number): KeyboardEvent {
  const event = document.createEvent('KeyboardEvent') as any;

  // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
  if (event.initKeyEvent) {
    event.initKeyEvent(type, true, true, window, 0, 0, 0, 0, 0, keyCode);
  } else {
    event.initKeyboardEvent(type, true, true, window, 0, undefined, 0, '', false);
  }

  // Webkit Browsers don't set the keyCode when calling the init function.
  // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
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
  const event = document.createEvent('MouseEvent');

  event.initMouseEvent(
    type,
    true /* canBubble */,
    false /* cancelable */,
    window /* view */,
    0 /* detail */,
    x /* screenX */,
    y /* screenY */,
    x /* clientX */,
    y /* clientY */,
    false /* ctrlKey */,
    false /* altKey */,
    false /* shiftKey */,
    false /* metaKey */,
    button /* button */,
    null /* relatedTarget */
  );

  // `initMouseEvent` doesn't allow us to pass the `buttons` and
  // defaults it to 0 which looks like a fake event.
  Object.defineProperty(event, 'buttons', { get: () => 1 });

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
