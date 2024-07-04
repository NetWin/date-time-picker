import {
  Overlay,
  OverlayConfig,
  OverlayContainer,
  OverlayRef,
  ScrollStrategy
} from '@angular/cdk/overlay';
import {
  ComponentPortal,
  ComponentType
} from '@angular/cdk/portal';
import { Location } from '@angular/common';
import {
  ComponentRef,
  Injectable,
  InjectionToken,
  Injector,
  StaticProvider,
  TemplateRef,
  inject
} from '@angular/core';
import { Observable, Subject, defer, startWith } from 'rxjs';
import { extendObject } from '../utils';
import { OwlDialogConfig, OwlDialogConfigInterface } from './dialog-config';
import { OwlDialogContainerComponent } from './dialog-container.component';
import { OwlDialogRef } from './dialog-ref.class';

export const OWL_DIALOG_DATA = new InjectionToken<unknown>('OwlDialogData');

/**
 * Injection token that determines the scroll handling while the dialog is open.
 */
export const OWL_DIALOG_SCROLL_STRATEGY = new InjectionToken<
  () => ScrollStrategy
>('owl-dialog-scroll-strategy');

export function OWL_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

export const OWL_DIALOG_SCROLL_STRATEGY_PROVIDER = {
  provide: OWL_DIALOG_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: OWL_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY
};

/**
 * Injection token that can be used to specify default dialog options.
 */
export const OWL_DIALOG_DEFAULT_OPTIONS = new InjectionToken<OwlDialogConfig>('owl-dialog-default-options');

@Injectable({ providedIn: 'root' })
export class OwlDialogService {

  readonly #overlay = inject(Overlay);

  readonly #injector = inject(Injector);

  readonly #location = inject(Location, { optional: true });

  readonly #scrollStrategy = inject<() => ScrollStrategy>(OWL_DIALOG_SCROLL_STRATEGY);

  readonly #defaultOptions = inject<OwlDialogConfigInterface>(OWL_DIALOG_DEFAULT_OPTIONS, { optional: true });

  readonly #parentDialog = inject(OwlDialogService, { optional: true, skipSelf: true });

  readonly #overlayContainer = inject(OverlayContainer);

  private ariaHiddenElements = new Map<Element, string | null>();

  private _openDialogsAtThisLevel: Array<OwlDialogRef<unknown>> = [];
  private _beforeOpenAtThisLevel = new Subject<OwlDialogRef<unknown>>();
  private _afterOpenAtThisLevel = new Subject<OwlDialogRef<unknown>>();
  private _afterAllClosedAtThisLevel = new Subject<void>();

  /** Keeps track of the currently-open dialogs. */
  public get openDialogs(): Array<OwlDialogRef<unknown>> {
    return this.#parentDialog
      ? this.#parentDialog.openDialogs
      : this._openDialogsAtThisLevel;
  }

  /** Stream that emits when a dialog has been opened. */
  public get beforeOpen(): Subject<OwlDialogRef<unknown>> {
    return this.#parentDialog
      ? this.#parentDialog.beforeOpen
      : this._beforeOpenAtThisLevel;
  }

  /** Stream that emits when a dialog has been opened. */
  public get afterOpen(): Subject<OwlDialogRef<unknown>> {
    return this.#parentDialog
      ? this.#parentDialog.afterOpen
      : this._afterOpenAtThisLevel;
  }

  public get _afterAllClosed(): Subject<void> {
    const parent = this.#parentDialog;
    return parent
      ? parent._afterAllClosed
      : this._afterAllClosedAtThisLevel;
  }

  /**
   * Stream that emits when all open dialog have finished closing.
   * Will emit on subscribe if there are no open dialogs to begin with.
   */

  public afterAllClosed: Observable<void> = defer(
    () =>
      this._openDialogsAtThisLevel.length
        ? this._afterAllClosed
        : this._afterAllClosed.pipe(startWith(undefined))
  );

  constructor() {
    if (!this.#parentDialog && this.#location) {
      this.#location.subscribe(() => this.closeAll());
    }
  }

  public open<T>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: OwlDialogConfigInterface
  ): OwlDialogRef<T> {
    config = extendObject(new OwlDialogConfig(), config, this.#defaultOptions);

    if (config.id && this.getDialogById(config.id)) {
      throw Error(
        `Dialog with id "${config.id
        }" exists already. The dialog id must be unique.`
      );
    }

    const overlayRef = this.createOverlay(config);
    const dialogContainer = this.attachDialogContainer(overlayRef, config);
    const dialogRef = this.attachDialogContent<T>(
      componentOrTemplateRef,
      dialogContainer,
      overlayRef,
      config
    );

    if (!this.openDialogs.length) {
      this.hideNonDialogContentFromAssistiveTechnology();
    }

    this.openDialogs.push(dialogRef);
    dialogRef
      .afterClosed()
      .subscribe(() => this.removeOpenDialog(dialogRef));
    this.beforeOpen.next(dialogRef);
    this.afterOpen.next(dialogRef);
    return dialogRef;
  }

  /**
   * Closes all of the currently-open dialogs.
   */
  public closeAll(): void {
    let i = this.openDialogs.length;

    while (i--) {
      this.openDialogs[i].close();
    }
  }

  /**
   * Finds an open dialog by its id.
   * @param id ID to use when looking up the dialog.
   */
  public getDialogById(id: string): OwlDialogRef<unknown> | undefined {
    return this.openDialogs.find(dialog => dialog.id === id);
  }

  private attachDialogContent<T>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    dialogContainer: OwlDialogContainerComponent,
    overlayRef: OverlayRef,
    config: OwlDialogConfigInterface
  ): OwlDialogRef<T> {
    const dialogRef = new OwlDialogRef<T>(
      overlayRef,
      dialogContainer,
      config.id,
      this.#location
    );

    if (config.hasBackdrop) {
      overlayRef.backdropClick().subscribe(() => {
        if (!dialogRef.disableClose) {
          dialogRef.close();
        }
      });
    }

    if (componentOrTemplateRef instanceof TemplateRef) {
      // create a portal from a template is not supported
      console.warn('Creating a dialog from a TemplateRef is not supported.');
    } else {
      const injector = this.createInjector<T>(
        config,
        dialogRef,
        dialogContainer
      );
      const contentRef = dialogContainer.attachComponentPortal(
        new ComponentPortal(componentOrTemplateRef, undefined, injector)
      );
      dialogRef.componentInstance = contentRef.instance;
    }

    dialogRef
      .updateSize(config.width, config.height)
      .updatePosition(config.position);

    return dialogRef;
  }

  private createInjector<T>(
    config: OwlDialogConfigInterface,
    dialogRef: OwlDialogRef<T>,
    dialogContainer: OwlDialogContainerComponent
  ): Injector {
    const userInjector = config?.viewContainerRef?.injector;
    const parentInjector = userInjector || this.#injector;
    const providers: Array<StaticProvider> = [
      { provide: OwlDialogRef, useValue: dialogRef },
      { provide: OwlDialogContainerComponent, useValue: dialogContainer },
      { provide: OWL_DIALOG_DATA, useValue: config.data }
    ];

    return Injector.create({ providers, parent: parentInjector });
  }

  private createOverlay(config: OwlDialogConfigInterface): OverlayRef {
    const overlayConfig = this.getOverlayConfig(config);
    return this.#overlay.create(overlayConfig);
  }

  private attachDialogContainer(
    overlayRef: OverlayRef,
    config: OwlDialogConfigInterface
  ): OwlDialogContainerComponent {
    const containerPortal = new ComponentPortal(
      OwlDialogContainerComponent,
      config.viewContainerRef
    );
    const containerRef: ComponentRef<
      OwlDialogContainerComponent
    > = overlayRef.attach(containerPortal);
    containerRef.instance.setConfig(config);

    return containerRef.instance;
  }

  private getOverlayConfig(dialogConfig: OwlDialogConfigInterface): OverlayConfig {
    const state = new OverlayConfig({
      positionStrategy: this.#overlay.position().global(),
      scrollStrategy:
        dialogConfig.scrollStrategy || this.#scrollStrategy(),
      panelClass: dialogConfig.paneClass,
      hasBackdrop: dialogConfig.hasBackdrop,
      minWidth: dialogConfig.minWidth,
      minHeight: dialogConfig.minHeight,
      maxWidth: dialogConfig.maxWidth,
      maxHeight: dialogConfig.maxHeight
    });

    if (dialogConfig.backdropClass) {
      state.backdropClass = dialogConfig.backdropClass;
    }

    return state;
  }

  private removeOpenDialog(dialogRef: OwlDialogRef<unknown>): void {
    const index = this._openDialogsAtThisLevel.indexOf(dialogRef);

    if (index > -1) {
      this.openDialogs.splice(index, 1);
      // If all the dialogs were closed, remove/restore the `aria-hidden`
      // to a the siblings and emit to the `afterAllClosed` stream.
      if (!this.openDialogs.length) {
        this.ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute('aria-hidden', previousValue);
          } else {
            element.removeAttribute('aria-hidden');
          }
        });

        this.ariaHiddenElements.clear();
        this._afterAllClosed.next();
      }
    }
  }

  /**
   * Hides all of the content that isn't an overlay from assistive technology.
   */
  private hideNonDialogContentFromAssistiveTechnology(): void {
    const overlayContainer = this.#overlayContainer.getContainerElement();

    // Ensure that the overlay container is attached to the DOM.
    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;

      for (let i = siblings.length - 1; i > -1; i--) {
        const sibling = siblings[i];

        if (
          sibling !== overlayContainer &&
          sibling.nodeName !== 'SCRIPT' &&
          sibling.nodeName !== 'STYLE' &&
          !sibling.hasAttribute('aria-live')
        ) {
          this.ariaHiddenElements.set(
            sibling,
            sibling.getAttribute('aria-hidden')
          );
          sibling.setAttribute('aria-hidden', 'true');
        }
      }
    }
  }
}
