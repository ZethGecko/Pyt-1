import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InspeccionService, InspeccionResponse, FichaInspeccionResponse, ParametroInspeccionResponse } from '../services/inspeccion.service';
import { IconComponent } from '../../../shared/components/ui/icon.component';

@Component({
  selector: 'app-realizar-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './realizar-inspeccion.component.html',
  styleUrls: ['./realizar-inspeccion.component.scss']
})
export class RealizarInspeccionComponent implements OnInit {
  inspeccionId: number = 0;
  inspeccion: InspeccionResponse | null = null;
  fichas: FichaInspeccionResponse[] = [];
  parametros: ParametroInspeccionResponse[] = [];
  
  // Filtro
  filtroPlaca = '';
  
  // Estado de la edición
  cargando = false;
  guardando = false;
  error: string | null = null;
  success: string | null = null;
  
  // Formulario de resultado
  resultadoSeleccionado: string = '';
  observaciones: string = '';
  
  // Resultados disponibles
  resultados = [
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'observado', label: 'Observado' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inspeccionService: InspeccionService
  ) {}
  
  ngOnInit(): void {
    this.inspeccionId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.inspeccionId) {
      this.cargarDatos();
    }
  }
  
  cargarDatos(): void {
    this.cargando = true;
    this.error = null;
    
    // Cargar inspección
    this.inspeccionService.obtener(this.inspeccionId).subscribe({
      next: (data) => {
        this.inspeccion = data;
        this.cargarFichas();
      },
      error: (err) => {
        this.error = 'Error al cargar la inspección';
        this.cargando = false;
      }
    });
  }
  
  cargarFichas(): void {
    this.inspeccionService.obtenerFichas(this.inspeccionId).subscribe({
      next: (fichas) => {
        this.fichas = fichas;
        this.cargarParametros();
      },
      error: (err) => {
        this.error = 'Error al cargar las fichas de inspección';
        this.cargando = false;
      }
    });
  }
  
  cargarParametros(): void {
    this.inspeccionService.listarParametros().subscribe({
      next: (params) => {
        this.parametros = params;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los parámetros';
        this.cargando = false;
      }
    });
  }
  
  get fichasFiltradas(): FichaInspeccionResponse[] {
    if (!this.filtroPlaca) return this.fichas;
    return this.fichas.filter(f => 
      f.parametroNombre?.toLowerCase().includes(this.filtroPlaca.toLowerCase())
    );
  }
  
  get vehiculosUnicos(): string[] {
    const placas = new Set<string>();
    this.fichas.forEach(f => {
      if (f.parametroNombre) {
        placas.add(f.parametroNombre);
      }
    });
    return Array.from(placas);
  }
  
  actualizarParametro(fichaId: number, valor: string, cumple: boolean, observaciones: string): void {
    const fichaActualizada = this.fichas.find(f => f.id === fichaId);
    if (fichaActualizada) {
      fichaActualizada.valor = valor;
      fichaActualizada.cumple = cumple;
      fichaActualizada.observaciones = observaciones;
    }
  }
  
  guardarCambios(): void {
    this.guardando = true;
    
    this.inspeccionService.guardarFichas(this.inspeccionId, this.fichas).subscribe({
      next: () => {
        this.mostrarMensaje('Cambios guardados correctamente');
        this.guardando = false;
      },
      error: (err) => {
        this.error = 'Error al guardar los cambios';
        this.guardando = false;
      }
    });
  }
  
  finalizarInspeccion(): void {
    if (!this.resultadoSeleccionado) {
      this.error = 'Debe seleccionar un resultado';
      return;
    }
    
    this.guardando = true;
    
    this.inspeccionService.registrarResultado(this.inspeccionId, {
      resultado: this.resultadoSeleccionado,
      observaciones: this.observaciones
    }).subscribe({
      next: () => {
        this.mostrarMensaje('Inspección finalizada correctamente');
        this.router.navigate(['/inspecciones']);
        this.guardando = false;
      },
      error: (err) => {
        this.error = 'Error al finalizar la inspección';
        this.guardando = false;
      }
    });
  }
  
  exportarResultados(): void {
    // Generar informe de texto
    let informe = '=== INFORME DE INSPECCIÓN ===\n\n';
    informe += `Inspección ID: ${this.inspeccionId}\n`;
    informe += `Empresa: ${this.inspeccion?.empresaNombre || 'N/A'}\n`;
    informe += `Fecha: ${new Date().toLocaleString()}\n`;
    informe += `Estado: ${this.inspeccion?.estado || 'N/A'}\n`;
    informe += `Resultado: ${this.inspeccion?.resultado || 'Pendiente'}\n\n`;
    
    informe += '=== FICHAS DE INSPECCIÓN ===\n\n';
    this.fichas.forEach(ficha => {
      informe += `Parámetro: ${ficha.parametroNombre || 'N/A'}\n`;
      informe += `Valor: ${ficha.valor || 'Sin especificar'}\n`;
      informe += `Cumple: ${ficha.cumple ? 'Sí' : 'No'}\n`;
      informe += `Observaciones: ${ficha.observaciones || 'Sin observaciones'}\n`;
      informe += '---\n';
    });
    
    // Crear blob y descargar
    const blob = new Blob([informe], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspeccion_${this.inspeccionId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.mostrarMensaje('Informe exportado correctamente');
  }
  
  private mostrarMensaje(mensaje: string): void {
    this.success = mensaje;
    setTimeout(() => this.success = null, 3000);
  }
  
  getResultClass(resultado?: string): string {
    const clases: Record<string, string> = {
      'aprobado': 'bg-green-100 text-green-800 border-green-200',
      'rechazado': 'bg-red-100 text-red-800 border-red-200',
      'observado': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return clases[resultado || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
