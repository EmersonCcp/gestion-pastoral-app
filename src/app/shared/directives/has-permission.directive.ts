import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { hasPermission } from '../utils/auth.utils';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: false
})
export class HasPermissionDirective implements OnDestroy {
  private hasView = false;
  private permissions: string | string[] = [];
  private sub?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    this.sub = this.authService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  @Input() set appHasPermission(permissions: string | string[]) {
    this.permissions = permissions;
    this.updateView();
  }

  private updateView() {
    const isAuthorized = hasPermission(this.permissions);

    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
