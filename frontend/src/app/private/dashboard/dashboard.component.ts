import { Component, inject, OnInit, computed, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../core/auth/state/auth.state';
import { TokenService } from '../../core/auth/services/token.service';
import { IconComponent } from '../../shared/components/ui/icon.component';
import { TramiteService } from '../../modules/tramites/services/tramite.service';
import { TramiteEnriquecido } from '../../modules/tramites/models/tramite.model';
import { NotificationService } from '../../shared/services/notification.service';
import { RevisionRequisitosComponent } from '../../modules/tramites/components/revision-requisitos/revision-requisitos.component';
import { Subject, of, Observable } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, RevisionRequisitosComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  authState = inject(AuthStateService);
  tokenService = inject(TokenService);
  tramiteService = inject(TramiteService);
  notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  constructor() {
    this.initDepartamentoNombreEffect();
  }

  // Signals
  tokenInfo = signal<any>(null);
  tokenExpiration = signal<Date | null>(null);
  lastLogin = signal<string | null>(null);
  showRawToken = signal(false);
  tramitesDepartamento = signal<TramiteEnriquecido[]>([]);
  loadingTramites = signal<boolean>(false);
  departamentoNombre = signal<string>('');

  // Modal de revisión
  mostrarModalRequisitos = signal<boolean>(false);
  tramiteParaRevisar = signal<TramiteEnriquecido | null>(null);

  // Computed values
  tokenUsername = computed(() => this.tokenInfo()?.username || 'N/A');
  tokenRoles = computed(() => this.tokenInfo()?.roles?.join(', ') || 'N/A');
  userInitial = computed(() => {
    const username = this.authState.currentUser()?.username;
    return username ? username.charAt(0).toUpperCase() : '?';
  });

  departamentoId = computed(() => {
    const user = this.authState.currentUser() as any;
    const dept = user?.departamento;
    return dept ? dept.id : null;
  });

  tokenRemainingPercentage = computed(() => {
    if (!this.tokenExpiration()) return 0;
    const now = new Date();
    const exp = this.tokenExpiration()!;
    const issuedAt = new Date(exp.getTime() - 3600000);
    const total = exp.getTime() - issuedAt.getTime();
    const remaining = exp.getTime() - now.getTime();
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  });

  private initDepartamentoNombreEffect(): void {
    effect(() => {
      const user = this.authState.currentUser() as any;
      const dept = user?.departamento;
      const role = user?.role?.name;
      if (role === 'SUPER_ADMIN') {
        this.departamentoNombre.set('Todos los departamentos');
      } else if (dept) {
        this.departamentoNombre.set(dept.nombre || 'Departamento');
      } else {
        this.departamentoNombre.set('Sin departamento');
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const info = this.tokenService.getTokenInfo();
    this.tokenInfo.set(info);
    
    if (info?.exp) {
      this.tokenExpiration.set(new Date(info.exp * 1000));
    }
    
    const user = this.authState.currentUser();
    if (user && (user as any).lastLogin) {
      this.lastLogin.set((user as any).lastLogin);
    }
    
    this.cargarTramitesDepartamento();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTramitesDepartamento(): void {
    const deptId = this.departamentoId();
    const user = this.authState.currentUser() as any;
    const tokenInfo = this.tokenService.getTokenInfo();
    const tokenRole = tokenInfo?.role;
    
    console.log('[Dashboard] User:', user);
    console.log('[Dashboard] Departamento ID:', deptId);
    console.log('[Dashboard] Role desde user:', user?.role);
    console.log('[Dashboard] Role desde token:', tokenRole);
    
    // SUPER_ADMIN o usuarios con canViewAllData ven todos los trámites
    const esSuperAdmin = user?.role?.name === 'SUPER_ADMIN' || tokenRole === 'SUPER_ADMIN';
    const puedeVerTodos = esSuperAdmin || user?.role?.canViewAllData === true;
    
    console.log('[Dashboard] esSuperAdmin:', esSuperAdmin, 'puedeVerTodos:', puedeVerTodos);

    let observable$: Observable<TramiteEnriquecido[]>;
    if (!deptId && !puedeVerTodos) {
      console.log('[Dashboard] Sin departamento y sin permisos -> mostrando vacío');
      this.tramitesDepartamento.set([]);
      this.loadingTramites.set(false);
      return;
    } else if (puedeVerTodos) {
      console.log('[Dashboard] Usuario con permisos amplios -> listando todos los trámites');
      observable$ = this.tramiteService.listarTodosEnriquecidos();
    } else {
      console.log('[Dashboard] Usuario con departamento', deptId, '-> listando por departamento');
      observable$ = this.tramiteService.listarPorDepartamento(deptId);
    }

    this.loadingTramites.set(true);
    observable$.pipe(
      takeUntil(this.destroy$),
      catchError((err: any) => {
        console.error('Error cargando trámites:', err);
        this.tramitesDepartamento.set([]);
        this.loadingTramites.set(false);
        return of([]);
      })
    ).subscribe({
      next: (tramites: TramiteEnriquecido[]) => {
        this.tramitesDepartamento.set(tramites);
        this.loadingTramites.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  toggleTokenView(): void {
    this.showRawToken.set(!this.showRawToken());
  }

  // ========== ACCIONES DE TRÁMITE ==========

  puedeRevisarRequisitos(tramite: TramiteEnriquecido): boolean {
    return ['registrado', 'en_revision', 'observado'].includes(tramite.estado);
  }

  abrirModalRevisar(tramite: TramiteEnriquecido): void {
    if (tramite.estado !== 'registrado' && tramite.estado !== 'en_revision') {
      this.notificationService.showWarning('Solo se pueden revisar trámites en estado "Registrado" o "En Revisión"');
      return;
    }

    if (tramite.estado === 'registrado') {
      const motivo = prompt('Ingrese el motivo para iniciar la revisión:');
      if (!motivo) return;

      this.tramiteService.cambiarEstado(tramite.id, 'en_revision', motivo).pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.notificationService.showError('Error al iniciar revisión');
          return of(null);
        })
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite en revisión');
          const tramiteActualizado = { ...tramite, estado: 'en_revision' as const };
          const listaActual = this.tramitesDepartamento();
          const nuevaLista = listaActual.map(t => t.id === tramite.id ? tramiteActualizado : t);
          this.tramitesDepartamento.set(nuevaLista);
          this.tramiteParaRevisar.set(tramiteActualizado);
          this.mostrarModalRequisitos.set(true);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.tramiteParaRevisar.set(tramite);
      this.mostrarModalRequisitos.set(true);
      this.cdr.detectChanges();
    }
  }

  cerrarModalRevisar(): void {
    this.mostrarModalRequisitos.set(false);
    this.tramiteParaRevisar.set(null);
    this.cargarTramitesDepartamento();
  }
}
