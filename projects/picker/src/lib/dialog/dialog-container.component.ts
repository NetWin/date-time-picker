/**
 * dialog-container.component
 */

import { AnimationEvent, animate, animateChild, keyframes, style, transition, trigger } from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  Optional,
  ViewChild
} from '@angular/core';
import { OwlDialogConfigInterface } from './dialog-config.class';

type AnimationParams = {
  x: string;
  y: string;
  ox: string;
  oy: string;
  scale: number;
};

const zoomFadeIn = {
  opacity: 0,
  transform: 'translateX({{ x }}) translateY({{ y }}) scale({{scale}})'
};
const zoomFadeInFrom = {
  opacity: 0,
  transform: 'translateX({{ x }}) translateY({{ y }}) scale({{scale}})',
  transformOrigin: '{{ ox }} {{ oy }}'
};

@Component({
  standalone: false,
  selector: 'owl-dialog-container',
  templateUrl: './dialog-container.component.html',
  animations: [
    trigger('slideModal', [
      transition(
        'void => enter',
        [
          style(zoomFadeInFrom),
          animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style('*')),
          animate(
            '150ms',
            keyframes([
              style({ transform: 'scale(1)', offset: 0 }),
              style({ transform: 'scale(1.05)', offset: 0.3 }),
              style({ transform: 'scale(.95)', offset: 0.8 }),
              style({ transform: 'scale(1)', offset: 1.0 })
            ])
          ),
          animateChild()
        ],
        {
          params: {
            x: '0px',
            y: '0px',
            ox: '50%',
            oy: '50%',
            scale: 1
          }
        }
      ),
      transition('enter => exit', [animateChild(), animate(200, style(zoomFadeIn))], {
        params: { x: '0px', y: '0px', ox: '50%', oy: '50%' }
      })
    ])
  ],
  host: {
    '(@slideModal.start)': 'onAnimationStart($event)',
    '(@slideModal.done)': 'onAnimationDone($event)',
    '[class.owl-dialog-container]': 'owlDialogContainerClass',
    '[attr.tabindex]': 'owlDialogContainerTabIndex',
    '[attr.id]': 'owlDialogContainerId',
    '[attr.role]': 'owlDialogContainerRole',
    '[attr.aria-labelledby]': 'owlDialogContainerAriaLabelledby',
    '[attr.aria-describedby]': 'owlDialogContainerAriaDescribedby',
    '[@slideModal]': 'owlDialogContainerAnimation'
  }
})
export class OwlDialogContainerComponent extends BasePortalOutlet {
  @ViewChild(CdkPortalOutlet, { static: true })
  public portalOutlet: CdkPortalOutlet | null = null;

  /** The class that traps and manages focus within the dialog. */
  private focusTrap: FocusTrap;

  /** ID of the element that should be considered as the dialog's label. */
  public ariaLabelledBy: string | null = null;

  /** Emits when an animation state changes. */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public isAnimating = false;

  private _config: OwlDialogConfigInterface;
  public get config(): OwlDialogConfigInterface {
    return this._config;
  }

  private state: 'void' | 'enter' | 'exit' = 'enter';

  // for animation purpose
  private params: AnimationParams = {
    x: '0px',
    y: '0px',
    ox: '50%',
    oy: '50%',
    scale: 0
  };

  // A variable to hold the focused element before the dialog was open.
  // This would help us to refocus back to element when the dialog was closed.
  private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

  protected readonly owlDialogContainerClass = true;

  protected get owlDialogContainerTabIndex(): number {
    return -1;
  }

  protected get owlDialogContainerId(): string {
    return this._config.id;
  }

  protected get owlDialogContainerRole(): string {
    return this._config.role || null;
  }

  protected get owlDialogContainerAriaLabelledby(): string {
    return this.ariaLabelledBy;
  }

  protected get owlDialogContainerAriaDescribedby(): string {
    return this._config.ariaDescribedBy || null;
  }

  protected get owlDialogContainerAnimation(): { value: string; params: AnimationParams } {
    return { value: this.state, params: this.params };
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private focusTrapFactory: FocusTrapFactory,
    @Optional()
    @Inject(DOCUMENT)
    private document: Document
  ) {
    super();
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   */
  public attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this.portalOutlet.hasAttached()) {
      throw Error('Attempting to attach dialog content after content is already attached');
    }

    this.savePreviouslyFocusedElement();
    return this.portalOutlet.attachComponentPortal(portal);
  }

  public attachTemplatePortal<C>(): EmbeddedViewRef<C> {
    throw new Error('Method not implemented.');
  }

  public setConfig(config: OwlDialogConfigInterface): void {
    this._config = config;

    if (config.event) {
      this.calculateZoomOrigin(config.event);
    }
  }

  public onAnimationStart(event: AnimationEvent): void {
    this.isAnimating = true;
    this.animationStateChanged.emit(event);
  }

  public onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'enter') {
      this.trapFocus();
    } else if (event.toState === 'exit') {
      this.restoreFocus();
    }

    this.animationStateChanged.emit(event);
    this.isAnimating = false;
  }

  public startExitAnimation(): void {
    this.state = 'exit';
    this.changeDetector.markForCheck();
  }

  /**
   * Calculate origin used in the `zoomFadeInFrom()`
   * for animation purpose
   */
  private calculateZoomOrigin(event: MouseEvent): void {
    if (!event) {
      return;
    }

    const clientX = event.clientX;
    const clientY = event.clientY;

    const wh = window.innerWidth / 2;
    const hh = window.innerHeight / 2;
    const x = clientX - wh;
    const y = clientY - hh;
    const ox = clientX / window.innerWidth;
    const oy = clientY / window.innerHeight;

    this.params.x = `${x}px`;
    this.params.y = `${y}px`;
    this.params.ox = `${ox * 100}%`;
    this.params.oy = `${oy * 100}%`;
    this.params.scale = 0;

    return;
  }

  /**
   * Save the focused element before dialog was open
   */
  private savePreviouslyFocusedElement(): void {
    if (this.document) {
      this.elementFocusedBeforeDialogWasOpened = this.document.activeElement as HTMLElement;
      setTimeout(() => this.elementRef.nativeElement.focus(), 0);
    }
  }

  private trapFocus(): void {
    if (!this.focusTrap) {
      this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    }

    if (this._config.autoFocus) {
      void this.focusTrap.focusInitialElementWhenReady();
    }
  }

  private restoreFocus(): void {
    const toFocus = this.elementFocusedBeforeDialogWasOpened;

    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus();
    }

    if (this.focusTrap) {
      this.focusTrap.destroy();
    }
  }
}
