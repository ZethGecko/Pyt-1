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
   tramitesFiltrados = signal<TramiteEnriquecido[]>([]);
   loadingTramites = signal<boolean>(false);
   departamentoNombre = signal<string>('');
   filtroEstado = signal<string>(''); // '' = todos

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
        this.departamentoNombre.set(dept?.nombre || 'Todos los departamentos');
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
     
     let observable$: Observable<TramiteEnriquecido[]>;
     if (tokenRole === 'SUPER_ADMIN') {
       console.log('[Dashboard] SUPER_ADMIN listando todos los trámites');
       observable$ = this.tramiteService.listarTodosEnriquecidos();
     } else if (!deptId) {
       console.log('[Dashboard] Sin departamento -> mostrando vacío');
       this.tramitesDepartamento.set([]);
       this.tramitesFiltrados.set([]);
       this.loadingTramites.set(false);
       return;
     } else {
       console.log('[Dashboard] Listando trámites del departamento', deptId);
       observable$ = this.tramiteService.listarPorDepartamento(deptId);
     }

     this.loadingTramites.set(true);
     observable$.pipe(
       takeUntil(this.destroy$),
       catchError((err: any) => {
         console.error('Error cargando trámites:', err);
         this.tramitesDepartamento.set([]);
         this.tramitesFiltrados.set([]);
         this.loadingTramites.set(false);
         return of([]);
       })
     ).subscribe({
       next: (tramites: TramiteEnriquecido[]) => {
         this.tramitesDepartamento.set(tramites);
         this.aplicarFiltroEstado();
         this.loadingTramites.set(false);
         this.cdr.detectChanges();
       }
     });
   }

   // Filtrar por estado
   filtrarPorEstado(estado: string): void {
     this.filtroEstado.set(estado);
     this.aplicarFiltroEstado();
   }

    private aplicarFiltroEstado(): void {
      const estado = this.filtroEstado();
      if (!estado) {
        this.tramitesFiltrados.set(this.tramitesDepartamento());
      } else {
        this.tramitesFiltrados.set(
          this.tramitesDepartamento().filter(t => 
            t.estado?.toLowerCase() === estado.toLowerCase()
          )
        );
      }
    }

  toggleTokenView(): void {
    this.showRawToken.set(!this.showRawToken());
  }

   // ========== ACCIONES DE TRÁMITE ==========

   puedeRevisarRequisitos(tramite: TramiteEnriquecido): boolean {
     const estado = tramite.estado?.toLowerCase();
     return ['registrado', 'en_revision', 'observado'].includes(estado);
   }

   abrirModalRevisar(tramite: TramiteEnriquecido): void {
     const estado = tramite.estado?.toLowerCase();
     if (estado !== 'registrado' && estado !== 'en_revision' && estado !== 'observado') {
       this.notificationService.showWarning('Solo se pueden revisar trámites en estado "Registrado", "En Revisión" u "Observado"');
       return;
     }

     if (estado === 'registrado') {
       // Iniciar revisión sin solicitar motivo
       this.tramiteService.cambiarEstado(tramite.id, 'en_revision').pipe(
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
            this.aplicarFiltroEstado(); // Aplicar filtro a la lista actualizada
            this.tramiteParaRevisar.set(tramiteActualizado);
            this.mostrarModalRequisitos.set(true);
            this.cdr.detectChanges();
          }
       });
      } else {
        // Ya está en revisión o observado, abrir modal directamente
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

    // ========== FILTROS ==========
    getEstadosDisponibles(): string[] {
      return ['registrado', 'en_revision', 'derivado', 'aprobado', 'rechazado', 'observado', 'finalizado', 'cancelado'];
    }

   // ========== UTILIDADES ==========
   getColorEstado(estado: string): string {
     const estadoLower = (estado || '').toLowerCase();
     if (['aprobado', 'finalizado'].includes(estadoLower)) return 'success';
     if (['rechazado', 'cancelado'].includes(estadoLower)) return 'danger';
     if (['observado', 'pendiente'].includes(estadoLower)) return 'warning';
     if (['en_revision', 'derivado'].includes(estadoLower)) return 'info';
     if (estadoLower === 'registrado') return 'primary';
     return 'secondary';
   }

   puedeFinalizarTramite(tramite: TramiteEnriquecido): boolean {
     return tramite.estado?.toLowerCase() === 'aprobado';
   }

   finalizarTramite(tramite: TramiteEnriquecido): void {
     if (!this.puedeFinalizarTramite(tramite)) {
       this.notificationService.showWarning('Solo se pueden finalizar trámites en estado "Aprobado"');
       return;
     }
     if (confirm('¿Está seguro de finalizar este trámite? Una vez finalizado no se podrán realizar modificaciones.')) {
       this.tramiteService.finalizar(tramite.id).subscribe({
         next: () => {
           this.notificationService.showSuccess('Trámite finalizado exitosamente');
           this.cargarTramitesDepartamento();
         },
         error: (err) => {
           this.notificationService.showError('Error al finalizar: ' + (err.message || 'Error desconocido'));
         }
       });
     }
   }
}
