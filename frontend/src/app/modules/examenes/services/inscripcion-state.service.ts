import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InscripcionExamen } from './inscripcion-examen.service';
import { InscripcionExamenService } from './inscripcion-examen.service';

@Injectable({
  providedIn: 'root'
})
export class InscripcionStateService {
  private inscripcionesSubject = new BehaviorSubject<InscripcionExamen[]>([]);
  private grupoInscripcionesSubject = new BehaviorSubject<{ [grupoId: number]: InscripcionExamen[] }>({});

  constructor(private inscripcionService: InscripcionExamenService) {}

  // Obtener todas las inscripciones (para Resultados Recientes)
  getInscripciones(): Observable<InscripcionExamen[]> {
    return this.inscripcionesSubject.asObservable();
  }

  // Obtener inscripciones por grupo (para Detalles del Grupo)
  getInscripcionesPorGrupo(grupoId: number): Observable<InscripcionExamen[]> {
    return this.grupoInscripcionesSubject.asObservable().pipe(
      map((grupoMap: { [grupoId: number]: InscripcionExamen[] }) => grupoMap[grupoId] || [])
    );
  }

  // Actualizar lista global
  setInscripciones(inscripciones: InscripcionExamen[]) {
    this.inscripcionesSubject.next(inscripciones);
    // También actualizar el mapa por grupo
    const mapa: { [grupoId: number]: InscripcionExamen[] } = {};
    inscripciones.forEach(ins => {
      if (ins.grupoPresentacion?.id) {
        if (!mapa[ins.grupoPresentacion.id]) mapa[ins.grupoPresentacion.id] = [];
        mapa[ins.grupoPresentacion.id].push(ins);
      }
    });
    this.grupoInscripcionesSubject.next(mapa);
  }

  // Actualizar una inscripción específica en todas las listas
  actualizarInscripcion(inscripcionActualizada: InscripcionExamen) {
    const actuales = this.inscripcionesSubject.getValue();
    const index = actuales.findIndex(i => i.id === inscripcionActualizada.id);
    if (index !== -1) {
      // Crear nuevo array global con la inscripción actualizada
      const nuevoGlobal = [...actuales];
      nuevoGlobal[index] = inscripcionActualizada;
      this.inscripcionesSubject.next(nuevoGlobal);
    }

    // Actualizar también en el mapa por grupo
    const mapa = this.grupoInscripcionesSubject.getValue();
    const grupoId = inscripcionActualizada.grupoPresentacion?.id;
    if (grupoId && mapa[grupoId]) {
      const idxGrupo = mapa[grupoId].findIndex(i => i.id === inscripcionActualizada.id);
      if (idxGrupo !== -1) {
        // Crear nuevo array para el grupo
        const nuevoArrayGrupo = [...mapa[grupoId]];
        nuevoArrayGrupo[idxGrupo] = inscripcionActualizada;
        mapa[grupoId] = nuevoArrayGrupo;
        this.grupoInscripcionesSubject.next({ ...mapa });
      }
    }
  }

  // Eliminar una inscripción de todas las listas
  eliminarInscripcion(inscripcionId: number) {
    const actuales = this.inscripcionesSubject.getValue().filter(i => i.id !== inscripcionId);
    this.inscripcionesSubject.next(actuales);

    const mapa = this.grupoInscripcionesSubject.getValue();
    const nuevoMapa: { [grupoId: number]: InscripcionExamen[] } = {};
    Object.keys(mapa).forEach(grupoId => {
      const gid = Number(grupoId);
      if (mapa[gid]) {
        nuevoMapa[gid] = mapa[gid].filter(i => i.id !== inscripcionId);
      }
    });
    this.grupoInscripcionesSubject.next(nuevoMapa);
  }

  // Agregar una inscripción (cuando se registra nueva)
  agregarInscripcion(inscripcion: InscripcionExamen) {
    const actuales = this.inscripcionesSubject.getValue();
    const nuevoGlobal = [...actuales, inscripcion];
    this.inscripcionesSubject.next(nuevoGlobal);

    const grupoId = inscripcion.grupoPresentacion?.id;
    if (grupoId) {
      const mapa = this.grupoInscripcionesSubject.getValue();
      const grupoActual = mapa[grupoId] || [];
      const nuevoArrayGrupo = [...grupoActual, inscripcion];
      mapa[grupoId] = nuevoArrayGrupo;
      this.grupoInscripcionesSubject.next({ ...mapa });
    }
  }

  // Cargar inscripciones de un grupo desde el backend (para forzar recarga)
  cargarInscripcionesPorGrupo(grupoId: number): void {
    this.inscripcionService.buscarConFiltros({ grupoId }).subscribe({
      next: (inscripciones: InscripcionExamen[]) => {
        const mapa = this.grupoInscripcionesSubject.getValue();
        mapa[grupoId] = inscripciones;
        this.grupoInscripcionesSubject.next({ ...mapa });

        // También actualizar la lista global
        const globales = this.inscripcionesSubject.getValue();
        inscripciones.forEach(ins => {
          const idx = globales.findIndex(i => i.id === ins.id);
          if (idx === -1) globales.push(ins);
        });
        this.inscripcionesSubject.next([...globales]);
      },
      error: (err: any) => console.error('Error cargando inscripciones por grupo:', err)
    });
  }

  // Limpiar (cuando se cierran modales)
  limpiar() {
    this.inscripcionesSubject.next([]);
    this.grupoInscripcionesSubject.next({});
  }
}
