import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departamento } from '../../../configuracion/models/departamento.model';
import { DepartamentoService } from '../../../configuracion/services/departamento.service';
import { UserService } from '../../../../core/auth/services/user.service';

@Component({
  selector: 'app-seleccionar-departamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccionar-departamento-modal.component.html'
})
export class SeleccionarDepartamentoModalComponent implements OnInit {
  @Input() tramiteCodigo?: string;
  @Output() derivar = new EventEmitter<{ departamentoId: number; instrucciones?: string; usuarioResponsableId?: number }>();
  @Output() cerrarModal = new EventEmitter<void>();

  departamentos: any[] = [];
  departamentoSeleccionado: any | null = null;
  usuariosDepartamento: any[] = [];
  usuarioResponsableSeleccionado: any | null = null;
  instrucciones: string = '';
  cargando: boolean = false;
  cargandoUsuarios: boolean = false;
  error: string | null = null;

  constructor(
    private departamentoService: DepartamentoService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  cargarDepartamentos(): void {
    this.cargando = true;
    this.error = null;
    this.departamentoService.listarTodos().subscribe({
      next: (departamentos: any[]) => {
        this.departamentos = departamentos.filter(d => d.activo);
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar departamentos';
        this.cargando = false;
        console.error('Error cargando departamentos:', err);
      }
    });
  }

  seleccionarDepartamento(departamento: any): void {
    this.departamentoSeleccionado = departamento;
    this.usuarioResponsableSeleccionado = null;
    this.usuariosDepartamento = [];
    this.error = null;
    if (departamento && departamento.id) {
      this.cargarUsuariosPorDepartamento(departamento.id);
    }
  }

  cargarUsuariosPorDepartamento(departamentoId: number): void {
    this.cargandoUsuarios = true;
    this.userService.listarPorDepartamento(departamentoId).subscribe({
      next: (usuarios: any[]) => {
        this.usuariosDepartamento = usuarios;
        this.cargandoUsuarios = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios del departamento:', err);
        this.usuariosDepartamento = [];
        this.cargandoUsuarios = false;
      }
    });
  }

  trackByDeptId(index: number, departamento: any): number {
    return departamento.id;
  }

  trackByUserId(index: number, usuario: any): number {
    return usuario.id;
  }

  onDerivar(): void {
    if (!this.departamentoSeleccionado) {
      this.error = 'Debe seleccionar un departamento';
      return;
    }
    this.cargando = true;
    this.derivar.emit({
      departamentoId: this.departamentoSeleccionado.id,
      instrucciones: this.instrucciones || undefined,
      usuarioResponsableId: this.usuarioResponsableSeleccionado?.id || undefined
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
