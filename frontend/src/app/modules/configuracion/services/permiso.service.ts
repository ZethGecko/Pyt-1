import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReglaTipoTramitePermisoService } from './regla-tipo-tramite-permiso.service';
import { TipoTramiteSolicitanteService, TipoTramiteSolicitantePermitido } from './tipo-tramite-solicitante.service';
import { ReglaTipoTramitePermiso } from '../models/regla-tipo-tramite-permiso.model';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  
  constructor(
    private reglaService: ReglaTipoTramitePermisoService,
    private tipoSolicitanteService: TipoTramiteSolicitanteService
  ) {}
  
  /**
   * Obtiene todas las reglas de permisos
   */
  getAll(page: number = 0, size: number = 100): Observable<ReglaTipoTramitePermiso[]> {
    return this.reglaService.listarTodos();
  }
  
  /**
   * Obtiene reglas por tipo de trámite
   */
  getByTipoTramiteId(tipoTramiteId: number): Observable<ReglaTipoTramitePermiso> {
    return this.reglaService.obtenerPorTipoTramiteId(tipoTramiteId);
  }
  
  /**
   * Obtiene tipos de solicitante permitidos por tipo de trámite
   */
  getTiposSolicitanteByTipoTramite(tipoTramiteId: number): Observable<TipoTramiteSolicitantePermitido[]> {
    return this.tipoSolicitanteService.getByTipoTramite(tipoTramiteId);
  }
  
  /**
   * Verifica si un tipo de solicitante está permitido para un tipo de trámite
   */
  isTipoSolicitantePermitido(tipoTramiteId: number, tipoSolicitante: string): Observable<boolean> {
    return this.tipoSolicitanteService.getByTipoTramite(tipoTramiteId).pipe(
      map(permisos => {
        return permisos.some(p => 
          p.tipoSolicitante === tipoSolicitante && p.activo
        );
      })
    );
  }
  
  /**
   * Obtiene reglas enriquecidas
   */
  getEnriquecidas(page: number = 0, size: number = 20): Observable<any> {
    return this.reglaService.listarEnriquecidos(page, size);
  }
  
  /**
   * Obtiene configuración completa de permisos para un tipo de trámite
   */
  getConfiguracionCompleta(tipoTramiteId: number): Observable<{
    regla?: ReglaTipoTramitePermiso;
    tiposSolicitante: TipoTramiteSolicitantePermitido[];
  }> {
    return new Observable(observer => {
      let regla: ReglaTipoTramitePermiso | undefined;
      let tiposSolicitante: TipoTramiteSolicitantePermitido[] = [];
      let completed = 0;
      
      this.reglaService.obtenerPorTipoTramiteId(tipoTramiteId).subscribe({
        next: (r) => {
          regla = r;
          completed++;
          if (completed === 2) {
            observer.next({ regla, tiposSolicitante });
            observer.complete();
          }
        },
        error: () => {
          completed++;
          if (completed === 2) {
            observer.next({ regla, tiposSolicitante });
            observer.complete();
          }
        }
      });
      
      this.tipoSolicitanteService.getByTipoTramite(tipoTramiteId).subscribe({
        next: (tipos) => {
          tiposSolicitante = tipos;
          completed++;
          if (completed === 2) {
            observer.next({ regla, tiposSolicitante });
            observer.complete();
          }
        },
        error: () => {
          completed++;
          if (completed === 2) {
            observer.next({ regla, tiposSolicitante });
            observer.complete();
          }
        }
      });
    });
  }
}
