import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthStateService } from '../../core/auth/state/auth.state';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authState = inject(AuthStateService);

  @Input() set appHasRole(role: string) {
    this.updateView(role);
  }

  @Input() appHasRoleElse?: TemplateRef<any>;

  private updateView(role: string): void {
    const hasRole = this.authState.hasRole(role);
    
    this.viewContainer.clear();
    
    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.appHasRoleElse) {
      this.viewContainer.createEmbeddedView(this.appHasRoleElse);
    }
  }
}