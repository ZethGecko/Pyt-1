import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RutaService, Ruta, RoutePreview } from '../services/ruta.service';
import { EmpresaService, EmpresaResponse } from '../services/empresa.service';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import * as L from 'leaflet';

interface RoutePreviewConEliminacion extends RoutePreview {
  eliminada?: boolean;
}

@Component({
  selector: 'app-gestion-puntos-ruta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './gestion-puntos-ruta.component.html',
  styleUrls: ['./gestion-puntos-ruta.component.scss']
})
export class GestionPuntosRutaComponent implements OnInit, AfterViewInit, OnDestroy {
  private comingFromSelection = false;

  rutas: Ruta[] = [];
  empresas: any[] = [];
  cargando = false;
  error: string | null = null;
  success: string | null = null;

  currentLocation: { lat: number; lng: number } | null = null;

  filtroNombre = '';

  mostrarModalSeleccionRuta = false;
  mostrarModalAsignarEmpresa = false;
  mostrarModalUpload = false;
  rutaSeleccionada: Ruta | null = null;

  parsedRoutes: RoutePreviewConEliminacion[] = [];
  selectedRouteIndex: number | null = null;
  selectedFile: File | null = null;
  isDragOver = false;
  asignacionModo: 'nueva' | 'existente' = 'nueva';

  uploadForm = {
    nombre: '',
    descripcion: '',
    empresaId: null as number | null
  };

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  private map: L.Map | undefined;
  private markers: L.Layer[] = [];
  private routeLayers: Map<number, L.FeatureGroup> = new Map();
  private currentLocationMarker: L.Marker | undefined;
  private routeColors: Map<number, string> = new Map();
  private rutaPreview: Ruta | null = null;

  routesAccordionOpen = true;

  constructor(private rutaService: RutaService, private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.cargarRutas();
    this.cargarEmpresas();
    this.getCurrentLocation();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  get totalRutas(): number { return this.rutas.length; }
  get rutasActivas(): number { return this.rutas.filter(r => r.estado === 'ACTIVO').length; }
  get rutasAsignadas(): number { return this.rutas.filter(r => r.empresaNombre).length; }
  get rutasSinAsignar(): number { return this.rutas.filter(r => !r.empresaNombre).length; }

  get puedeGuardar(): boolean {
    if (this.asignacionModo === 'nueva') {
      if (this.selectedRouteIndex === null) return false;
      const idx = this.selectedRouteIndex;
      if (idx < 0 || idx >= this.parsedRoutes.length) return false;
      const rutaSeleccionada = this.parsedRoutes[idx];
      return !!(this.selectedFile && this.uploadForm.nombre && rutaSeleccionada && !rutaSeleccionada.eliminada);
    } else {
      return true;
    }
  }

  get puedePrevisualizar(): boolean {
    if (this.selectedRouteIndex === null) return false;
    const idx = this.selectedRouteIndex;
    if (idx < 0 || idx >= this.parsedRoutes.length) return false;
    const r = this.parsedRoutes[idx];
    return r !== undefined && !r.eliminada;
  }

  get puedeGuardarTodas(): boolean {
    return this.parsedRoutes.some(r => !r.eliminada);
  }

  onFiltroChange(value: string): void {
    this.updateMap();
  }

  getRutasFiltradas(): Ruta[] {
    if (!this.filtroNombre?.trim()) return this.rutas;
    const term = this.filtroNombre.toLowerCase();
    return this.rutas.filter(r => r.nombre.toLowerCase().includes(term));
  }

  cargarRutas(): void {
    this.cargando = true;
    this.error = null;
    this.rutaPreview = null;

    this.rutaService.getAll().subscribe({
      next: (rutas: Ruta[]) => {
        this.rutas = rutas;
        console.log('Rutas cargadas:', this.rutas.length);
        this.cargando = false;
        this.updateMap();
        setTimeout(() => {
          this.map?.invalidateSize();
          this.updateMap();
        }, 100);
      },
      error: (err: any) => {
        this.error = 'Error al cargar rutas: ' + (err.message || 'Error desconocido');
        this.cargando = false;
      }
    });
  }

  cargarEmpresas(): void {
    this.empresaService.listarTodos().subscribe({
      next: (empresas: EmpresaResponse[]) => {
        this.empresas = empresas;
      },
      error: (err) => {
        console.error('Error cargando empresas:', err);
      }
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.map) {
            this.updateMap();
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }

  abrirModalUpload(): void {
    this.fileInput.nativeElement.click();
  }

  getRouteColor(rutaId: number): string {
    if (!this.routeColors.has(rutaId)) {
      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ];
      const colorIndex = rutaId % colors.length;
      this.routeColors.set(rutaId, colors[colorIndex]);
    }
    return this.routeColors.get(rutaId)!;
  }

  toggleRutaVisibility(ruta: Ruta): void {
    if (this.routeLayers.has(ruta.idRuta)) {
      const layer = this.routeLayers.get(ruta.idRuta);
      if (layer) {
        this.map!.removeLayer(layer);
        this.routeLayers.delete(ruta.idRuta);
      }
    } else {
      this.addRutaToMap(ruta);
    }
  }

  verSoloRuta(ruta: Ruta): void {
    this.clearRouteLayers();
    this.addRutaToMap(ruta);
    if (this.routeLayers.has(ruta.idRuta)) {
      const layer = this.routeLayers.get(ruta.idRuta)!;
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        this.map!.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
      }
    }
  }

  toggleRoutesAccordion(): void {
    this.routesAccordionOpen = !this.routesAccordionOpen;
  }

  clearRouteLayers(): void {
    this.routeLayers.forEach(layer => {
      if (this.map && this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.routeLayers.clear();
  }

  addRutaToMap(ruta: Ruta): void {
    console.log('Añadiendo ruta al mapa:', ruta.nombre, 'puntos:', ruta.puntosRuta?.length);
    let points: [number, number][] = [];

    if (ruta.puntosRuta && ruta.puntosRuta.length > 0) {
      points = ruta.puntosRuta.map((p: any) => [p.latitud, p.longitud]);
    } else if (ruta.kmlContent) {
      points = this.extractPointsFromKML(ruta.kmlContent);
    }

    if (points.length === 0) {
      console.log(`Ruta ${ruta.nombre} no tiene puntos para mostrar`);
      return;
    }

    const color = this.getRouteColor(ruta.idRuta);
    const layerGroup = L.featureGroup();

    const polyline = L.polyline(points, {
      color: color,
      weight: 4,
      opacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    }).bindPopup(`<b>${ruta.nombre}</b><br>${ruta.descripcion || 'Sin descripción'}`);

    polyline.addTo(layerGroup);

    const startIcon = L.divIcon({
      className: 'custom-marker start-marker',
      html: `<div class="marker-pin" style="background: ${color}">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
               </svg>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const endIcon = L.divIcon({
      className: 'custom-marker end-marker',
      html: `<div class="marker-pin" style="background: ${color}">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
               </svg>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const startMarker = L.marker(points[0], { icon: startIcon })
      .bindPopup(`<b>Inicio:</b> ${ruta.nombre}`);
    const endMarker = L.marker(points[points.length - 1], { icon: endIcon })
      .bindPopup(`<b>Fin:</b> ${ruta.nombre}`);

    startMarker.addTo(layerGroup);
    endMarker.addTo(layerGroup);

    if (this.map) {
      layerGroup.addTo(this.map);
      this.routeLayers.set(ruta.idRuta, layerGroup);
    }
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container not found');
      return;
    }

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement).setView([-12.0464, -77.0428], 10);

    if (L.Icon.Default) {
      L.Icon.Default.mergeOptions({
        iconUrl: '/assets/images/leaflet/marker-icon.png',
        iconRetinaUrl: '/assets/images/leaflet/marker-icon-2x.png',
        shadowUrl: '/assets/images/leaflet/marker-shadow.png',
      });
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMap();
  }

  extractPointsFromKML(kmlContent: string): [number, number][] {
    const points: [number, number][] = [];

    try {
      const placemarks = kmlContent.split("<Placemark");
      for (let i = 1; i < placemarks.length; i++) {
        const placemark = placemarks[i];

        if (placemark.indexOf("<coordinates>") >= 0) {
          const coordsStr = placemark.substring(placemark.indexOf("<coordinates>") + 13, placemark.indexOf("</coordinates>"));
          const coords = coordsStr.trim().split(",");
          if (coords.length >= 2) {
            try {
              const lng = parseFloat(coords[0].trim());
              const lat = parseFloat(coords[1].trim());
              if (!isNaN(lat) && !isNaN(lng)) {
                points.push([lat, lng]);
              }
            } catch (e) {
              // Skip invalid coordinates
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing KML for points:', e);
    }

    return points;
  }

  updateMap(): void {
    console.log('updateMap llamado. rutaPreview:', this.rutaPreview?.nombre, 'rutas total:', this.rutas.length);
    if (!this.map) {
      console.warn('Mapa no inicializado, intentando init...');
      this.initMap();
      return;
    }

    if (this.currentLocationMarker && this.map.hasLayer(this.currentLocationMarker)) {
      this.map.removeLayer(this.currentLocationMarker);
    }
    this.currentLocationMarker = undefined;

    this.clearRouteLayers();

    if (this.currentLocation) {
      this.currentLocationMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng])
        .addTo(this.map)
        .bindPopup('Tu ubicación actual');
    }

    const rutasAMostrar: Ruta[] = this.rutaPreview ? [this.rutaPreview] : this.getRutasFiltradas();
    console.log('Rutas a mostrar:', rutasAMostrar.length);

    rutasAMostrar.forEach(ruta => {
      this.addRutaToMap(ruta);
    });

    setTimeout(() => {
      if (!this.map) return;
      if (this.routeLayers.size > 0) {
        const allLayers = Array.from(this.routeLayers.values());
        const bounds = L.featureGroup(allLayers).getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds.pad(0.1));
        }
      } else if (this.currentLocation) {
        this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 13);
      } else {
        this.map.setView([-15.8402, -70.0219], 13);
      }
      this.map.invalidateSize();
    }, 100);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onFileSelected({ target: { files: files } });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.kml') || file.name.endsWith('.kmz'))) {
      this.selectedFile = file;
      this.error = null;
      this.parseKmlFile(file);
    } else {
      this.error = 'Por favor selecciona un archivo KML válido';
    }
  }

  private parseKmlFile(file: File): void {
    this.cargando = true;
    this.error = null;

    this.rutaService.parseKml(file).subscribe({
      next: (response) => {
        this.parsedRoutes = (response || []).map(r => ({ ...r, eliminada: false }));
        console.log(`KML parsed successfully: ${this.parsedRoutes.length} routes found`);
        this.cargando = false;
        this.selectedRouteIndex = null;
        this.ajustarIndiceSeleccion();
        this.mostrarModalSeleccionRuta = true;
      },
      error: (err) => {
        this.error = 'Error al parsear KML: ' + (err.message || 'Error desconocido');
        this.cargando = false;
      }
    });
  }

  previewSelectedRoute(): void {
    if (this.selectedRouteIndex === null) return;
    const idx = this.selectedRouteIndex;
    if (idx < 0 || idx >= this.parsedRoutes.length) return;

    const selectedRoute = this.parsedRoutes[idx];
    if (!selectedRoute || selectedRoute.eliminada) {
      this.error = 'No se puede previsualizar una ruta eliminada';
      return;
    }

    console.log('Previsualizando ruta:', selectedRoute.name);

    this.rutaPreview = {
      idRuta: 0,
      nombre: selectedRoute.name,
      descripcion: selectedRoute.description || '',
      estado: 'ACTIVO',
      puntosRuta: selectedRoute.points.map((p, i) => ({
        idPuntoRuta: i,
        latitud: p.lat,
        longitud: p.lng,
        orden: i,
        usuarioRegistra: null
      }))
    };

    this.updateMap();
  }

  previewRouteInModal(index: number): void {
    if (index < 0 || index >= this.parsedRoutes.length) return;

    const selectedRoute = this.parsedRoutes[index];
    if (!selectedRoute || selectedRoute.eliminada) {
      this.error = 'No se puede previsualizar una ruta eliminada';
      return;
    }

    this.selectedRouteIndex = index;

    this.rutaPreview = {
      idRuta: 0,
      nombre: selectedRoute.name,
      descripcion: selectedRoute.description || '',
      estado: 'ACTIVO',
      puntosRuta: selectedRoute.points.map((p, i) => ({
        idPuntoRuta: i,
        latitud: p.lat,
        longitud: p.lng,
        orden: i,
        usuarioRegistra: null
      }))
    };

    this.updateMap();
  }

  abrirModalAsignarEmpresa(): void {
    if (this.selectedRouteIndex === null) return;
    const idx = this.selectedRouteIndex;
    if (idx < 0 || idx >= this.parsedRoutes.length) return;

    const selectedRoute = this.parsedRoutes[idx];
    if (!selectedRoute || selectedRoute.eliminada) {
      this.error = 'No se puede asignar una ruta eliminada';
      return;
    }

    this.rutaSeleccionada = {
      idRuta: 0,
      nombre: selectedRoute.name,
      descripcion: selectedRoute.description || '',
      estado: 'ACTIVO',
      puntosRuta: selectedRoute.points.map((p, i) => ({
        idPuntoRuta: i,
        latitud: p.lat,
        longitud: p.lng,
        orden: i,
        usuarioRegistra: null
      }))
    } as Ruta;

    this.mostrarModalAsignarEmpresa = true;
    this.asignacionModo = 'nueva';
  }

  cerrarModalSeleccionRuta(): void {
    this.rutaPreview = null;
    this.mostrarModalSeleccionRuta = false;
    this.parsedRoutes = [];
    this.selectedRouteIndex = null;
    this.selectedFile = null;
    this.updateMap();
  }

  cerrarModalAsignarEmpresa(): void {
    this.rutaPreview = null;
    this.mostrarModalAsignarEmpresa = false;
    this.rutaSeleccionada = null;
    this.uploadForm = { nombre: '', descripcion: '', empresaId: null };
    this.updateMap();
  }

  seleccionarRuta(index: number): void {
    if (index >= 0 && index < this.parsedRoutes.length) {
      const route = this.parsedRoutes[index];
      if (route && !route.eliminada) {
        this.selectedRouteIndex = index;
      }
    }
  }

  seleccionarRutaDesdeTarjeta(index: number): void {
    this.seleccionarRuta(index);
  }

  verRuta(ruta: Ruta): void {
    this.clearRouteLayers();
    this.addRutaToMap(ruta);
    if (this.routeLayers.has(ruta.idRuta)) {
      const layer = this.routeLayers.get(ruta.idRuta)!;
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        this.map!.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
      }
    }
  }

  abrirModalAsignar(ruta: Ruta): void {
    this.rutaSeleccionada = ruta;
    this.uploadForm.empresaId = ruta.empresaId ?? null;
    this.mostrarModalAsignarEmpresa = true;
    this.asignacionModo = 'existente';
  }

  guardarNuevaRuta(): void {
    if (this.selectedRouteIndex === null) return;
    const idx = this.selectedRouteIndex;
    if (idx < 0 || idx >= this.parsedRoutes.length) return;

    const selectedRoute = this.parsedRoutes[idx];
    if (!selectedRoute) return;

    const rutaData: Partial<Ruta> = {
      nombre: this.uploadForm.nombre,
      descripcion: this.uploadForm.descripcion,
      estado: 'ACTIVO',
      puntosRuta: selectedRoute.points.map((p, i) => ({
        latitud: p.lat,
        longitud: p.lng,
        orden: i
      }))
    };

    if (this.uploadForm.empresaId !== null) {
      rutaData.empresaId = this.uploadForm.empresaId;
    }

    this.rutaService.create(rutaData).subscribe({
      next: (savedRuta) => {
        this.success = 'Ruta guardada exitosamente';
        this.rutaPreview = null;
        this.cerrarModalSeleccionRuta();
        this.cerrarModalAsignarEmpresa();
        this.cargarRutas();
      },
      error: (err) => {
        this.error = 'Error al guardar ruta: ' + (err.message || 'Error desconocido');
      }
    });
  }

  guardarTodasRutas(): void {
    const rutasAGuardar = this.parsedRoutes.filter(r => !r.eliminada);
    if (rutasAGuardar.length === 0) {
      this.error = 'No hay rutas para guardar';
      return;
    }

    let guardadas = 0;
    let errores = 0;

    rutasAGuardar.forEach((route) => {
      const rutaData: Partial<Ruta> = {
        nombre: route.name,
        descripcion: route.description || '',
        estado: 'ACTIVO',
        puntosRuta: route.points.map((p, i) => ({
          latitud: p.lat,
          longitud: p.lng,
          orden: i
        }))
      };

      this.rutaService.create(rutaData).subscribe({
        next: () => {
          guardadas++;
          if (guardadas === rutasAGuardar.length) {
            this.success = `${guardadas} rutas guardadas exitosamente`;
            this.cerrarModalSeleccionRuta();
            this.cargarRutas();
          }
        },
        error: (err) => {
          errores++;
          console.error('Error guardando ruta', route.name, err);
          if (errores === rutasAGuardar.length) {
            this.error = 'Error al guardar todas las rutas';
          }
        }
      });
    });
  }

  actualizarEmpresa(): void {
    if (!this.rutaSeleccionada) return;

    const updateData: Partial<Ruta> = {};
    if (this.uploadForm.empresaId !== null) {
      updateData.empresaId = this.uploadForm.empresaId;
    }

    this.rutaService.update(this.rutaSeleccionada.idRuta, updateData).subscribe({
      next: () => {
        this.success = 'Empresa asignada correctamente';
        this.cerrarModalAsignarEmpresa();
        this.cargarRutas();
      },
      error: (err) => {
        this.error = 'Error al asignar empresa: ' + (err.message || 'Error desconocido');
      }
    });
  }

  eliminarRuta(idRuta: number): void {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;

    this.rutaService.delete(idRuta).subscribe({
      next: () => {
        this.success = 'Ruta eliminada correctamente';
        this.cargarRutas();
      },
      error: (err) => {
        this.error = 'Error al eliminar ruta: ' + (err.message || 'Error desconocido');
      }
    });
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  eliminarRutaParseada(index: number): void {
    if (index >= 0 && index < this.parsedRoutes.length) {
      const r = this.parsedRoutes[index];
      if (r) {
        r.eliminada = true;
        if (this.selectedRouteIndex === index) {
          this.ajustarIndiceSeleccion();
        } else if (this.selectedRouteIndex !== null && this.selectedRouteIndex > index) {
          this.selectedRouteIndex = this.parsedRoutes
            .slice(0, this.selectedRouteIndex)
            .filter(r => !r.eliminada).length - 1;
        }
      }
    }
  }

  restaurarRutaParseada(index: number): void {
    if (index >= 0 && index < this.parsedRoutes.length) {
      const r = this.parsedRoutes[index];
      if (r) {
        r.eliminada = false;
        if (this.selectedRouteIndex === null) {
          this.selectedRouteIndex = index;
        }
      }
    }
  }

  getPrimerIndiceDisponible(): number | null {
    const index = this.parsedRoutes.findIndex(r => !r.eliminada);
    return index >= 0 ? index : null;
  }

  ajustarIndiceSeleccion(): void {
    this.selectedRouteIndex = this.getPrimerIndiceDisponible();
  }
}
