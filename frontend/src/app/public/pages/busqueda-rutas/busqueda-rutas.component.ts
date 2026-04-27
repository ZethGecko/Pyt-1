import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { BusquedaRutasService, RutaBusqueda, BusquedaRutasRequest } from '../../../shared/services/busqueda-rutas.service';

@Component({
  selector: 'app-busqueda-rutas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './busqueda-rutas.component.html',
  styleUrls: ['./busqueda-rutas.component.scss']
})
export class BusquedaRutasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

   map: L.Map | null = null;
   isLoading = false;
   error: string | null = null;
   rutas: RutaBusqueda[] = [];
   empresas: any[] = [];
   puntosGeograficos: any[] = [];

   busquedaRequest: BusquedaRutasRequest = {};

   private routeLayers: L.Polyline[] = [];
   private originMarker: L.CircleMarker | null = null;
   private destMarker: L.Marker | null = null;
   isSettingOrigin = false; // toggle para modo selección de origen

  constructor(
    private busquedaRutasService: BusquedaRutasService,
    private cdr: ChangeDetectorRef
  ) {}

   ngAfterViewInit(): void {
     this.initMap();
     this.loadInitialData();
   }

   ngOnDestroy(): void {
     if (this.map) {
       this.map.remove();
     }
   }

   private updateCursor(): void {
     if (this.map) {
       this.map.getContainer().style.cursor = this.isSettingOrigin ? 'crosshair' : '';
     }
   }

   toggleOriginMode(): void {
     this.isSettingOrigin = !this.isSettingOrigin;
     this.updateCursor();
     this.cdr.detectChanges();
   }

   private initMap(): void {
     this.map = L.map(this.mapContainer.nativeElement, {
       center: [40.416775, -3.703790],
       zoom: 13,
       zoomControl: true
     });

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attribution: '© OpenStreetMap contributors'
     }).addTo(this.map!);

     this.map.on('click', (e: L.LeafletMouseEvent) => {
       if (this.isSettingOrigin) {
         this.setOrigen(e.latlng.lat, e.latlng.lng);
         this.isSettingOrigin = false;
         this.updateCursor();
       } else {
         this.setDestino(e.latlng.lat, e.latlng.lng);
       }
     });
   }

   private setOrigen(lat: number, lng: number): void {
     this.busquedaRequest.rutaPartida = { latitud: lat, longitud: lng };
     this.error = null;
     this.rutas = [];
     this.clearRoutes();

     if (!this.originMarker) {
       this.originMarker = L.circleMarker([lat, lng], {
         radius: 8, color: '#10b981', fillColor: '#10b981', fillOpacity: 1
       }).addTo(this.map!);
     } else {
       this.originMarker.setLatLng([lat, lng]);
     }
     this.cdr.detectChanges();
   }

   private setDestino(lat: number, lng: number): void {
     this.busquedaRequest.destino = { latitud: lat, longitud: lng };
     this.error = null;
     this.rutas = [];
     this.clearRoutes();

     if (!this.destMarker) {
       const icon = L.divIcon({
         className: 'destino-marker',
         html: '<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
         iconSize: [16, 16],
         iconAnchor: [8, 8]
       });
       this.destMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(this.map!);
       this.destMarker.on('dragend', (ev) => {
         const ll = (ev.target as L.Marker).getLatLng();
         this.setDestino(ll.lat, ll.lng);
       });
     } else {
       this.destMarker.setLatLng([lat, lng]);
     }
     this.cdr.detectChanges();
   }

   usarUbicacionActual(): void {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => {
           const lat = pos.coords.latitude;
           const lng = pos.coords.longitude;
           // Establecer como origen (rutaPartida)
           this.busquedaRequest.rutaPartida = { latitud: lat, longitud: lng };
           this.busquedaRequest.ubicacionActual = { latitud: lat, longitud: lng };
           this.error = null;
           this.rutas = [];
           this.clearRoutes();

           if (this.isSettingOrigin) {
             this.isSettingOrigin = false;
             this.updateCursor();
           }

           if (!this.originMarker) {
             this.originMarker = L.circleMarker([lat, lng], {
               radius: 8, color: '#10b981', fillColor: '#10b981', fillOpacity: 1
             }).addTo(this.map!);
           } else {
             this.originMarker.setLatLng([lat, lng]);
           }
           this.map!.panTo([lat, lng]);
           this.cdr.detectChanges();
         },
         () => {
           this.error = 'No se pudo obtener la ubicación';
           this.cdr.detectChanges();
         }
       );
     } else {
       this.error = 'Geolocalización no disponible';
       this.cdr.detectChanges();
     }
   }

  private loadInitialData(): void {
    this.busquedaRutasService.obtenerEmpresas().subscribe({
      next: (data: any[]) => { this.empresas = data; this.cdr.detectChanges(); }
    });
    this.busquedaRutasService.obtenerPuntosGeograficos().subscribe({
      next: (data: any[]) => { this.puntosGeograficos = data; this.cdr.detectChanges(); }
    });
  }

  buscarRutas(): void {
    if (!this.validateSearch()) return;
    this.isLoading = true;
    this.error = null;

    this.busquedaRutasService.buscarRutas(this.busquedaRequest).subscribe({
      next: (rutas: RutaBusqueda[]) => {
        this.rutas = rutas;
        this.isLoading = false;
        this.renderRoutes(rutas);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al buscar rutas';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

   private validateSearch(): boolean {
     if (!this.busquedaRequest.destino) {
       this.error = 'Selecciona un destino en el mapa';
       return false;
     }
     const origen = this.busquedaRequest.rutaPartida || this.busquedaRequest.ubicacionActual;
     if (!origen) {
       this.error = 'Establece un origen: usa "Mi ubicación" o "Establecer origen" y luego clic en el mapa';
       return false;
     }
     return true;
   }

  private renderRoutes(rutas: RutaBusqueda[]): void {
    this.clearRoutes();
    if (rutas.length === 0) return;

    const bounds: L.LatLngTuple[] = [];
    rutas.forEach(ruta => {
      const latlngs = ruta.puntos.map(p => [p.latitud, p.longitud] as L.LatLngExpression);
      const line = L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(this.map!);
      this.routeLayers.push(line);

      L.circleMarker(latlngs[0], { radius: 8, color: '#10b981', fillColor: '#10b981', fillOpacity: 1 }).addTo(this.map!);
      L.circleMarker(latlngs[latlngs.length - 1], { radius: 8, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }).addTo(this.map!);

      ruta.puntos.forEach(p => bounds.push([p.latitud, p.longitud] as L.LatLngTuple));
    });

    if (bounds.length > 0) {
      this.map!.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private clearRoutes(): void {
    this.routeLayers.forEach(layer => this.map!.removeLayer(layer));
    this.routeLayers = [];
  }

   limpiarBusqueda(): void {
     this.busquedaRequest = {};
     this.rutas = [];
     this.error = null;
     if (this.map) {
       this.clearRoutes();
       if (this.originMarker) { this.map.removeLayer(this.originMarker); this.originMarker = null; }
       if (this.destMarker) { this.map.removeLayer(this.destMarker); this.destMarker = null; }
     }
     if (this.isSettingOrigin) {
       this.isSettingOrigin = false;
       this.updateCursor();
     }
     this.cdr.detectChanges();
   }

  formatearDistancia(d: number): string { return d.toFixed(2) + ' km'; }
  formatearDuracion(d: number): string { return d.toFixed(2) + ' min'; }

  mostrarRutaEnMapa(ruta: RutaBusqueda): void {
    this.clearRoutes();
    const latlngs = ruta.puntos.map(p => [p.latitud, p.longitud] as L.LatLngExpression);
    const line = L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(this.map!);
    this.routeLayers.push(line);
    this.map!.fitBounds(L.latLngBounds(latlngs as L.LatLngExpression[]), { padding: [50, 50] });
    this.cdr.detectChanges();
  }

   get ubicacionActualText(): string {
     const o = this.busquedaRequest.rutaPartida || this.busquedaRequest.ubicacionActual;
     if (o) {
       return `${o.latitud.toFixed(4)}, ${o.longitud.toFixed(4)}`;
     }
     return 'No seleccionado';
   }

   get destinoText(): string {
     if (this.busquedaRequest.destino) {
       return `${this.busquedaRequest.destino.latitud.toFixed(4)}, ${this.busquedaRequest.destino.longitud.toFixed(4)}`;
     }
     return 'Selecciona en el mapa';
   }

   trackById(index: number, item: RutaBusqueda): number {
     return item.id;
   }

   clearError(): void {
     this.error = null;
     this.cdr.detectChanges();
   }
}
