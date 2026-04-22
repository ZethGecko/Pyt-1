import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SeguimientoTramite, TimelineItem } from '../models/seguimiento-tramite.model';

@Injectable({ providedIn: 'root' })
export class SeguimientoTramiteService {
  private apiUrl = `${environment.apiUrl}/seguimiento-tramites`;

  constructor(private http: HttpClient) {}

  // ========== SEGUIMIENTO ==========
  
  listarPorTramite(tramiteId: number): Observable<SeguimientoTramite[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tramite/${tramiteId}/historial`).pipe(
      map(segs => segs.map(seg => this.mapearSeguimiento(seg)))
    );
  }

  obtenerSeguimientoActivo(tramiteId: number): Observable<SeguimientoTramite> {
    return this.http.get<any>(`${this.apiUrl}/tramite/${tramiteId}/activo`).pipe(
      map(seg => this.mapearSeguimiento(seg))
    );
  }

  iniciarSeguimiento(tramiteId: number, etapaId: number): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/iniciar`, {
      tramiteId,
      etapaId
    });
  }

  avanzarEtapa(seguimientoId: number, siguienteEtapaId: number): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/${seguimientoId}/avanzar`, {
      siguienteEtapaId
    });
  }

  completarEtapa(seguimientoId: number, observaciones?: string): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/${seguimientoId}/completar`, {
      observaciones
    });
  }

  bloquearEtapa(seguimientoId: number, motivo: string): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/${seguimientoId}/bloquear`, {
      motivo
    });
  }

  desbloquearEtapa(seguimientoId: number): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/${seguimientoId}/desbloquear`, {});
  }

  asignarResponsable(seguimientoId: number, usuarioId?: number, departamentoId?: number): Observable<SeguimientoTramite> {
    return this.http.post<SeguimientoTramite>(`${this.apiUrl}/${seguimientoId}/asignar-responsable`, {
      usuarioId,
      departamentoId
    });
  }

  agregarObservacion(seguimientoId: number, observacion: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${seguimientoId}/observaciones`, {
      observacion
    });
  }

  // ========== CONVERSIÓN A TIMELINE ==========

  convertirATimeline(seguimientos: any[]): TimelineItem[] {
    return seguimientos.map((s, index) => ({
      id: s.id,
      title: s.etapaActual?.nombreEtapa || `Etapa ${index + 1}`,
      description: s.observaciones,
      date: s.fechaInicioEtapa,
      status: this.mapearEstadoATimeline(s.estadoEtapa),
      details: {
        'Departamento': s.departamentoResponsable?.nombre || 'Sin departamento',
        'Usuario': s.usuarioResponsable?.username || 'Sin asignar',
        'Estado': this.getEstadoEtapaLabel(s.estadoEtapa)
      },
      // Campos para compatibilidad con template existente
      etapa: s.etapaActual?.nombreEtapa || `Etapa ${index + 1}`,
      departamento: s.departamentoResponsable?.nombre || 'Sin departamento',
      fecha: s.fechaInicioEtapa
    }));
  }

  private mapearEstadoATimeline(estado: string): 'completed' | 'current' | 'pending' | 'error' {
    switch (estado) {
      case 'COMPLETADA': return 'completed';
      case 'EN_PROGRESO': return 'current';
      case 'PENDIENTE': return 'pending';
      case 'BLOQUEADA': return 'error';
      default: return 'pending';
    }
  }

  private mapearSeguimiento(seg: any): SeguimientoTramite {
    return {
      id: seg.id,
      tramite: seg.tramite ? {
        id: seg.tramite.id,
        codigoRUT: seg.tramite.codigoRUT
      } : null,
      etapaActual: seg.etapaActual ? {
        id: seg.etapaActual.id,
        nombreEtapa: seg.etapaActual.nombreEtapa,
        orden: seg.etapaActual.orden
      } : null,
      usuarioResponsable: seg.usuarioResponsable ? {
        id: seg.usuarioResponsable.id,
        username: seg.usuarioResponsable.username,
        nombre: seg.usuarioResponsable.username
      } : null,
      departamentoResponsable: seg.departamentoResponsable ? {
        id: seg.departamentoResponsable.id,
        codigo: seg.departamentoResponsable.codigo,
        nombre: seg.departamentoResponsable.nombre
      } : null,
      fechaInicioEtapa: seg.fechaInicioEtapa,
      fechaFinEtapa: seg.fechaFinEtapa,
      estadoEtapa: seg.estadoEtapa,
      tiempoTranscurridoHoras: seg.tiempoTranscurridoHoras,
      observaciones: seg.observaciones,
      fechaCreacion: seg.fechaCreacion,
      fechaActualizacion: seg.fechaActualizacion
    };
  }

  getEstadoEtapaLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'EN_PROGRESO': 'En Progreso',
      'COMPLETADA': 'Completada',
      'BLOQUEADA': 'Bloqueada'
    };
    return labels[estado] || estado;
  }
}
