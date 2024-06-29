import {
  AnimationEvent,
  animate,
  animateChild,
  keyframes,
  style,
  transition,
  trigger
} from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  TemplatePortal
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  HostBinding,
  HostListener,
  ViewChild,
  inject
} from '@angular/core';
import { OwlDialogConfigInterface } from './dialog-config';

type AnimationState = 'void' | 'enter' | 'exit';
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
      transition(
        'enter => exit',
        [animateChild(), animate(200, style(zoomFadeIn))],
        { params: { x: '0px', y: '0px', ox: '50%', oy: '50%' } }
      )
    ])
  ]
})
export class OwlDialogContainerComponent extends BasePortalOutlet {

  readonly #changeDetector = inject(ChangeDetectorRef);

  readonly #elementRef = inject(ElementRef);

  readonly #focusTrapFactory = inject(FocusTrapFactory);

  readonly #document = inject(DOCUMENT, { optional: true });

  @ViewChild(CdkPortalOutlet, { static: true })
  portalOutlet: CdkPortalOutlet | null = null;

  /** The class that traps and manages focus within the dialog. */
  private focusTrap: FocusTrap;

  /** ID of the element that should be considered as the dialog's label. */
  public ariaLabelledBy: string | null = null;

  /** Emits when an animation state changes. */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  public isAnimating = false;

  private _config: OwlDialogConfigInterface;
  get config(): OwlDialogConfigInterface {
    return this._config;
  }

  private state: AnimationState = 'enter';

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

  @HostBinding('class.owl-dialog-container')
  get owlDialogContainerClass(): boolean {
    return true;
  }

  @HostBinding('attr.tabindex')
  get owlDialogContainerTabIndex(): number {
    return -1;
  }

  @HostBinding('attr.id')
  get owlDialogContainerId(): string {
    return this._config.id;
  }

  @HostBinding('attr.role')
  get owlDialogContainerRole(): string {
    return this._config.role || null;
  }

  @HostBinding('attr.aria-labelledby')
  get owlDialogContainerAriaLabelledby(): string {
    return this.ariaLabelledBy;
  }

  @HostBinding('attr.aria-describedby')
  get owlDialogContainerAriaDescribedby(): string {
    return this._config.ariaDescribedBy || null;
  }

  @HostBinding('@slideModal')
  get owlDialogContainerAnimation(): { value: AnimationState, params: AnimationParams } {
    return { value: this.state, params: this.params };
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   */
  public attachComponentPortal<T>(
    portal: ComponentPortal<T>
  ): ComponentRef<T> {
    if (this.portalOutlet.hasAttached()) {
      throw Error(
        'Attempting to attach dialog content after content is already attached'
      );
    }

    this.savePreviouslyFocusedElement();
    return this.portalOutlet.attachComponentPortal(portal);
  }

  public attachTemplatePortal<C>(
    portal: TemplatePortal<C>
  ): EmbeddedViewRef<C> {
    throw new Error('Method not implemented.');
  }

  public setConfig(config: OwlDialogConfigInterface): void {
    this._config = config;

    if (config.event) {
      this.calculateZoomOrigin(event);
    }
  }

  @HostListener('@slideModal.start', ['$event'])
  public onAnimationStart(event: AnimationEvent): void {
    this.isAnimating = true;
    this.animationStateChanged.emit(event);
  }

  @HostListener('@slideModal.done', ['$event'])
  public onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'enter') {
      this.trapFocus();
    } else if (event.toState === 'exit') {
      this.restoreFocus();
    }

    this.animationStateChanged.emit(event);
    this.isAnimating = false;
  }

  public startExitAnimation() {
    this.state = 'exit';
    this.#changeDetector.markForCheck();
  }

  /**
   * Calculate origin used in the `zoomFadeInFrom()`
   * for animation purpose
   */
  private calculateZoomOrigin(event: any): void {
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
    if (this.#document) {
      this.elementFocusedBeforeDialogWasOpened = this.#document
        .activeElement as HTMLElement;

      Promise.resolve().then(() => this.#elementRef.nativeElement.focus());
    }
  }

  private trapFocus(): void {
    if (!this.focusTrap) {
      this.focusTrap = this.#focusTrapFactory.create(
        this.#elementRef.nativeElement
      );
    }

    if (this._config.autoFocus) {
      this.focusTrap.focusInitialElementWhenReady();
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
