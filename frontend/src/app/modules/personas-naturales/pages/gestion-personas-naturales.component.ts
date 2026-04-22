import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PersonaNaturalService, PersonaNatural, PersonaNaturalCreateRequest, PersonaNaturalUpdateRequest, FiltrosPersonaNatural, PersonaNaturalEstadisticas } from '../services/persona-natural.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-gestion-personas-naturales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-personas-naturales.component.html',
  styleUrls: ['./gestion-personas-naturales.component.scss']
})
export class GestionPersonasNaturalesComponent implements OnInit {
  // Datos
  personas: PersonaNatural[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Filtros
  filtroBusqueda = '';
  filtroGenero = '';
  filtroConEmail = false;
  filtroConTelefono = false;

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Modal
  mostrarModal = false;
  modoModal: 'crear' | 'editar' = 'crear';
  personaSeleccionada: PersonaNatural | null = null;

  // Formulario
  formulario: PersonaNaturalCreateRequest = {
    nombres: '',
    apellidos: '',
    dni: 0,
    genero: undefined,
    telefono: '',
    email: '',
    observaciones: ''
  };

  // Estadísticas
  estadisticas: PersonaNaturalEstadisticas | null = null;

  constructor(
    private personaNaturalService: PersonaNaturalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarEstadisticas();
  }

  // ✅ CARGAR DATOS CON forkJoin
  cargarDatosIniciales(): void {
    this.cargando = true;
    this.error = null;

    forkJoin({
      personas: this.personaNaturalService.listarTodos(),
      estadisticas: this.personaNaturalService.obtenerEstadisticasPorGenero()
    }).subscribe({
      next: (resultado) => {
        this.personas = resultado.personas;
        this.estadisticas = {
          total: resultado.personas.length,
          conEmail: resultado.personas.filter(p => p.email).length,
          conTelefono: resultado.personas.filter(p => p.telefono).length,
          porGenero: resultado.estadisticas
        };
        this.actualizarPaginacion();
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Error al cargar datos iniciales';
        console.error('Error cargando datos iniciales:', err);
        this.cargarDatosDemo();
      }
    });
  }

  cargarEstadisticas(): void {
    this.personaNaturalService.obtenerEstadisticasPorGenero().subscribe({
      next: (porGenero) => {
        if (this.estadisticas) {
          this.estadisticas.porGenero = porGenero;
        }
      },
      error: (err) => console.error('Error cargando estadísticas:', err)
    });
  }

  cargarDatosDemo(): void {
    const demo: PersonaNatural[] = [
      {
        id: 1,
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        dni: 12345678,
        genero: 'MASCULINO',
        telefono: '987654321',
        email: 'juan.perez@email.com',
        fechaRegistro: new Date(),
        observaciones: 'Cliente frecuente'
      },
      {
        id: 2,
        nombres: 'María Luisa',
        apellidos: 'García López',
        dni: 87654321,
        genero: 'FEMENINO',
        telefono: '912345678',
        email: 'maria.garcia@email.com',
        fechaRegistro: new Date()
      },
      {
        id: 3,
        nombres: 'Pedro',
        apellidos: 'Rodríguez Martínez',
        dni: 11112222,
        genero: 'MASCULINO',
        telefono: undefined,
        email: undefined,
        fechaRegistro: new Date()
      }
    ];
    this.personas = demo;
    this.actualizarPaginacion();
  }

  // Filtros
  get personasFiltradas(): PersonaNatural[] {
    let result = this.personas;

    if (this.filtroBusqueda) {
      const term = this.filtroBusqueda.toLowerCase();
      result = result.filter(p =>
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(term) ||
        p.dni.toString().includes(term) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.telefono && p.telefono.includes(term))
      );
    }

    if (this.filtroGenero) {
      result = result.filter(p => p.genero === this.filtroGenero);
    }

    if (this.filtroConEmail) {
      result = result.filter(p => p.email && p.email.trim() !== '');
    }

    if (this.filtroConTelefono) {
      result = result.filter(p => p.telefono && p.telefono.trim() !== '');
    }

    return result;
  }

  actualizarPaginacion(): void {
    this.totalElements = this.personasFiltradas.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }

  get personasPaginadas(): PersonaNatural[] {
    const start = this.currentPage * this.pageSize;
    return this.personasFiltradas.slice(start, start + this.pageSize);
  }

  // CRUD
  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.personaSeleccionada = null;
    this.formulario = {
      nombres: '',
      apellidos: '',
      dni: 0,
      genero: undefined,
      telefono: '',
      email: '',
      observaciones: ''
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(persona: PersonaNatural): void {
    this.modoModal = 'editar';
    this.personaSeleccionada = persona;
    this.formulario = {
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      dni: persona.dni,
      genero: persona.genero,
      telefono: persona.telefono || '',
      email: persona.email || '',
      observaciones: persona.observaciones || ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.personaSeleccionada = null;
  }

  guardar(): void {
    if (!this.validarFormulario()) {
      this.error = 'Por favor complete los campos obligatorios';
      return;
    }

    this.cargando = true;
    this.error = null;

    const operation = this.modoModal === 'crear'
      ? this.personaNaturalService.crear(this.formulario)
      : this.personaNaturalService.actualizar(this.personaSeleccionada!.id, this.formulario);

    operation.subscribe({
      next: () => {
        this.cargando = false;
        this.cerrarModal();
        this.mostrarExito(this.modoModal === 'crear' ? 'Persona creada exitosamente' : 'Persona actualizada exitosamente');
        this.cargarDatosIniciales();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || `Error al ${this.modoModal === 'crear' ? 'crear' : 'actualizar'} persona`;
        console.error('Error guardando persona:', err);
      }
    });
  }

  eliminar(persona: PersonaNatural): void {
    if (!confirm(`¿Está seguro de eliminar a ${this.personaNaturalService.formatNombreCompleto(persona)}?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;

    this.personaNaturalService.eliminar(persona.id).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarExito('Persona eliminada exitosamente');
        this.cargarDatosIniciales();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || 'Error al eliminar persona';
        console.error('Error eliminando persona:', err);
      }
    });
  }

  validarFormulario(): boolean {
    return !!this.formulario.nombres &&
           !!this.formulario.apellidos &&
           this.formulario.dni > 0;
  }

  // Utilidades
  formatNombreCompleto(persona: PersonaNatural): string {
    return this.personaNaturalService.formatNombreCompleto(persona);
  }

  formatContacto(persona: PersonaNatural): string {
    return this.personaNaturalService.formatContacto(persona);
  }

  getGeneroLabel(genero?: string): string {
    return this.personaNaturalService.getGeneroLabel(genero);
  }

  getGeneroClass(genero?: string): string {
    return this.personaNaturalService.getGeneroClass(genero);
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  mostrarExito(mensaje: string): void {
    this.exito = mensaje;
    setTimeout(() => this.exito = null, 3000);
  }

  // Paginación
  cambiarPagina(page: number): void {
    this.currentPage = page;
  }

  // Filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroGenero = '';
    this.filtroConEmail = false;
    this.filtroConTelefono = false;
    this.currentPage = 0;
  }

  // Estadísticas
  get totalPersonas(): number {
    return this.personas.length;
  }

  get personasConEmail(): number {
    return this.personas.filter(p => p.email && p.email.trim() !== '').length;
  }

  get personasConTelefono(): number {
    return this.personas.filter(p => p.telefono && p.telefono.trim() !== '').length;
  }

  get generoStats(): Map<string, number> {
    const stats = new Map<string, number>();
    this.personas.forEach(p => {
      const genero = p.genero || 'No especificado';
      stats.set(genero, (stats.get(genero) || 0) + 1);
    });
    return stats;
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(0, this.currentPage - halfVisible);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
