import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TareasInspeccionService, TareaColumnaDTO, TareasInspeccionResponse } from './tareas-inspeccion.service';
import { IconComponent } from '../../../shared/components/ui/icon.component';

@Component({
  selector: 'app-tareas-inspeccion',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './tareas-inspeccion.component.html',
  styleUrls: ['./tareas-inspeccion.component.scss']
})
export class TareasInspeccionComponent implements OnInit {
  inspeccionId!: number;
  columnas: TareaColumnaDTO[] = [];
  filas: Record<string, unknown>[] = [];
  cantidad = 0;
  cargando = false;
  error: string | null = null;
  private esUtilCache: Set<string> = new Set();
  // activo para reposición de iluminación
  activo: number = 0;
  reposicionIluminacion: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tareasService: TareasInspeccionService
  ) {}

  ngOnInit(): void {
    this.inspeccionId = Number(this.route.snapshot.paramMap.get('idInspeccion'));
    if (isNaN(this.inspeccionId) || this.inspeccionId <= 0) {
      this.error = 'Identificador de inspección inválido.';
      return;
    }
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.cargando = true;
    this.error = null;
    this.tareasService.obtenerTareasPorInspeccion(this.inspeccionId)
      .pipe(
        tap((resp: TareasInspeccionResponse) => {
          this.columnas = resp.columnas ?? [];
          this.filas = resp.filas ?? [];
          this.cantidad = resp.cantidad ?? 0;

          // Construir activo a partir de las columnas recibidas
          // Si viene el campo "activo" en las filas, lo tomamos directamente;
          // si no, contamos las filas que tienen esUtil=true (columnas de contenido)
          this.reposicionIluminacion = this.filas.length;
          this.activo = this.filas.filter((fila: Record<string, unknown>) => {
            // Si la columna "activo" existe directamente en la fila, úsala
            if (fila['activo'] !== undefined) {
              return fila['activo'] === 'true';
            }
            // Fallback: cuenta columnas es_util del objeto activo
            if (fila['activo'] === undefined && typeof fila['es_util'] === 'boolean') {
              return true; // al menos la columna es útil
            }
            return false;
          }).length;

          // Construir cache de campos es_util
          this.esUtilCache = new Set(
            this.columnas.filter(c => c.esUtil === true).map(c => c.field)
          );
        }),
        catchError(err => {
          console.error('[TareasInspeccion] Error cargando tareas:', err);
          this.error = 'No se encontraron resultados. Consulta la inspección y vuelve a intentarlo.';
          this.columnas = [];
          this.filas = [];
          this.cantidad = 0;
          return of(null);
        })
      )
      .subscribe(() => {
        this.cargando = false;
      });
  }

  volver(): void {
    this.router.navigate(['/inspecciones']);
  }

  obtenerValor(fila: Record<string, unknown>, columna: TareaColumnaDTO): unknown {
    return fila[columna.field];
  }

  renderValor(valor: unknown): string {
    if (valor === null || valor === undefined) return '—';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    return String(valor);
  }

  esColumnaUtil(columna: TareaColumnaDTO): boolean {
    return columna.esUtil === true;
  }
}
