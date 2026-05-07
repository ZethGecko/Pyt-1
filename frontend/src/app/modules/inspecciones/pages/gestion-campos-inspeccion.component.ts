import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParametrosInspeccionService } from '../services/parametros-inspeccion.service';
import { ParametroInspeccion } from '../services/ficha-inspeccion.service';

@Component({
  selector: 'app-gestion-campos-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-campos-inspeccion.component.html',
  styleUrls: ['./gestion-campos-inspeccion.component.scss']
})
export class GestionCamposInspeccionComponent implements OnInit {
  parametros: ParametroInspeccion[] = [];
  nuevoParametro: string = '';
  modoEdicion: boolean = false;
  campoEditandoId: number | null = null;
  valorEditando: string = '';

  constructor(
    private parametrosService: ParametrosInspeccionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarParametros();
  }

  private cargarParametros(): void {
    this.parametrosService.listarTodos().subscribe({
      next: (params) => {
        this.parametros = params.sort((a, b) => 
          (a.idParametros || 0) - (b.idParametros || 0)
        );
      },
      error: (err: any) => {
        console.error('Error cargando parámetros:', err);
        alert('Error al cargar los parámetros');
      }
    });
  }

  agregarCampo(): void {
    if (!this.nuevoParametro.trim()) {
      alert('Ingrese un nombre para el campo');
      return;
    }

    const nuevo: Partial<ParametroInspeccion> = {
      parametro: this.nuevoParametro.trim(),
      observacion: '',
      fichaInspeccionId: 1
    };

    this.parametrosService.crear(nuevo).subscribe({
      next: (creado) => {
        this.nuevoParametro = '';
        this.cargarParametros();
      },
      error: (err: any) => {
        console.error('Error creando parámetro:', err);
        alert('Error al crear el campo');
      }
    });
  }

  iniciarEdicion(id: number, valorActual: string): void {
    this.campoEditandoId = id;
    this.valorEditando = valorActual;
    this.modoEdicion = true;
  }

  guardarEdicion(): void {
    if (this.campoEditandoId === null) return;

    this.parametrosService.actualizar(this.campoEditandoId, {
      parametro: this.valorEditando
    }).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarParametros();
      },
      error: (err: any) => {
        console.error('Error actualizando parámetro:', err);
        alert('Error al guardar el cambio');
      }
    });
  }

  cancelarEdicion(): void {
    this.campoEditandoId = null;
    this.valorEditando = '';
    this.modoEdicion = false;
  }

  eliminarCampo(id: number, nombre: string): void {
    if (!confirm(`¿Está seguro de eliminar el campo "${nombre}"?`)) {
      return;
    }

    this.parametrosService.eliminar(id).subscribe({
      next: () => {
        this.cargarParametros();
      },
      error: (err: any) => {
        console.error('Error eliminando parámetro:', err);
        alert('Error al eliminar el campo');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/inspecciones']);
  }
}
