import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnDestroy } from '@angular/core';
import { PermissionService } from '../../core/auth/services/permission.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnDestroy {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);
  
  private permissionSubscription?: Subscription;

  @Input() set appHasPermission(permission: string) {
    this.updateView(permission);
  }

  @Input() appHasPermissionTable?: string;
  @Input() appHasPermissionAction: string = 'view';

  private updateView(permission: string): void {
    // Limpiar vista anterior
    this.viewContainer.clear();

    // Verificar permiso
    const hasPermission = this.appHasPermissionTable ?
      this.permissionService.hasTablePermission(this.appHasPermissionTable, this.appHasPermissionAction) :
      this.permissionService.hasTablePermission(permission, this.appHasPermissionAction);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy(): void {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
  }
}