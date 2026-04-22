import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../../core/auth/state/auth.state';
import { IconComponent } from '../../../../shared/components/ui/icon.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <app-icon name="user" size="md"></app-icon>
        Mi Perfil
      </h1>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <app-icon name="user" size="lg" customClass="text-white"></app-icon>
          </div>
          <div>
            <p class="text-gray-700"><strong>Usuario:</strong> {{authState.currentUser()?.username}}</p>
            <p class="text-gray-700"><strong>Rol:</strong> {{authState.userRole()}}</p>
          </div>
        </div>
        <p class="text-gray-700"><strong>Email:</strong> {{authState.currentUser()?.email || 'No disponible'}}</p>
      </div>
    </div>
  `
})
export class PerfilComponent {
  authState = inject(AuthStateService);
}
