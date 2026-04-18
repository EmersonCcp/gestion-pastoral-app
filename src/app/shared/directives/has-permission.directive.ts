import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { hasPermission } from '../utils/auth.utils';

@Directive({
  selector: '[appHasPermission]',
  standalone: false
})
export class HasPermissionDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appHasPermission(permissions: string | string[]) {
    const isAuthorized = hasPermission(permissions);

    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
