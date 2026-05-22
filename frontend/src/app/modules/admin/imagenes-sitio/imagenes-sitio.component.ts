import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ImagenSitioService, ImagenSitio as ImagenDto, UbicacionConfig } from '../../../shared/services/imagen-sitio.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-imagenes-sitio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagenes-sitio.component.html',
  styleUrls: ['./imagenes-sitio.component.scss']
})
export class ImagenesSitioComponent implements OnInit {
  private imagenService = inject(ImagenSitioService);
  private notificationService = inject(NotificationService);

  imagenes: ImagenDto[] = [];
  ubicacionesConfig: UbicacionConfig[] = [];
  cargando = false;

  // Form upload
  ubicacionSeleccionada: string = '';
  descripcion: string = '';
  archivo: File | null = null;
  archivoNombre: string = '';
  imagenExistente: ImagenDto | null = null;

  ngOnInit(): void {
    this.cargarImagenes();
    this.ubicacionesConfig = this.imagenService.getUbicacionesConfig();
  }

  cargarImagenes(): void {
    this.cargando = true;
    this.imagenService.listarTodas().subscribe({
      next: (imgs) => {
        this.imagenes = imgs;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando imágenes', err);
        this.cargando = false;
        this.notificationService.error('Error al cargar imágenes', 'Error');
      }
    });
  }

  onArchivoSeleccionado(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.archivo = files[0];
      this.archivoNombre = files[0].name;
    }
  }

  verificarImagenExistente(): void {
    if (!this.ubicacionSeleccionada) {
      this.imagenExistente = null;
      return;
    }
    this.imagenService.obtenerPorUbicacion(this.ubicacionSeleccionada).subscribe({
      next: (img) => {
        this.imagenExistente = img;
      },
      error: () => {
        this.imagenExistente = null;
      }
    });
  }

  subirImagen(): void {
    if (!this.ubicacionSeleccionada || !this.archivo) {
      this.notificationService.error('Seleccione una ubicación y un archivo', 'Validación');
      return;
    }

    const esReemplazo = !!this.imagenExistente;
    const mensajeExito = esReemplazo
      ? 'Imagen reemplazada exitosamente'
      : 'Imagen subida exitosamente';

    this.cargando = true;
    this.imagenService.uploadImagen(this.ubicacionSeleccionada, this.archivo, this.descripcion).subscribe({
      next: (imagen) => {
        this.cargando = false;
        this.limpiarFormulario();
        this.cargarImagenes();
        this.notificationService.success(mensajeExito, 'Éxito');
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error('Error al subir imagen: ' + (err.error || err.message), 'Error');
      }
    });
  }

  eliminarImagen(id: number): void {
    if (!confirm('¿Está seguro que desea eliminar esta imagen?')) {
      return;
    }

    this.imagenService.eliminarImagen(id).subscribe({
      next: () => {
        this.cargarImagenes();
        this.notificationService.success('Imagen eliminada', 'Éxito');
      },
      error: (err) => {
        this.notificationService.error('Error al eliminar imagen', 'Error');
      }
    });
  }

  getImagenUrl(imagen: ImagenDto): string {
    return `${environment.apiUrl}/imagenes-sitio/${imagen.id}/download`;
  }

  getUbicacionLabel(ubicacionKey: string): string {
    const config = this.ubicacionesConfig.find(c => c.key === ubicacionKey);
    return config ? config.label : ubicacionKey;
  }

  getUbicacionDescripcion(): string {
    const config = this.ubicacionesConfig.find(c => c.key === this.ubicacionSeleccionada);
    return config ? (config.description || config.recommendedDimensions || '') : '';
  }

  limpiarFormulario(): void {
    this.ubicacionSeleccionada = '';
    this.descripcion = '';
    this.archivo = null;
    this.archivoNombre = '';
    this.imagenExistente = null;
  }
}
