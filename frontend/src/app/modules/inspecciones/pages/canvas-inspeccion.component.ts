import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InspeccionService, InspeccionResponse, FichaInspeccionResponse, ParametroInspeccionResponse } from '../services/inspeccion.service';
import { ElementoCanvasService, ElementoCanvas } from '../services/elemento-canvas.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-canvas-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="canvas-container">
      <!-- Header -->
      <div class="canvas-header">
        <div class="header-left">
          <button class="btn-back" (click)="volver()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Volver
          </button>
          <div class="header-info">
            <h1>Ficha de Inspección - {{ inspeccion?.empresaNombre || 'Cargando...' }}</h1>
            <p>Vehículo: {{ inspeccion?.vehiculoPlaca || 'N/A' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <!-- Controles de Hojas -->
          <div class="hoja-controls">
            <button class="btn btn-secondary btn-sm" (click)="anteriorHoja()" [disabled]="hojaActual <= 1">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="hoja-info">
              Hoja {{hojaActual}} de {{numeroTotalHojas}}
            </span>
            <button class="btn btn-secondary btn-sm" (click)="siguienteHoja()" [disabled]="hojaActual >= numeroTotalHojas">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="btn btn-accent btn-sm" (click)="agregarNuevaHoja()" [disabled]="guardando">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nueva Hoja
            </button>
            <button class="btn btn-danger btn-sm" (click)="eliminarHojaActual()" [disabled]="numeroTotalHojas <= 1 || guardando" 
                    title="Eliminar hoja actual">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
          <div class="canvas-actions">
            <button class="btn btn-secondary" (click)="limpiarCanvas()" [disabled]="guardando">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Limpiar
            </button>
            <button class="btn btn-primary" (click)="guardarCanvas()" [disabled]="guardando">
              <span *ngIf="guardando">Guardando...</span>
              <span *ngIf="!guardando">Guardar Ficha</span>
            </button>
          </div>
        </div>
      </div>

      <div class="canvas-workspace" *ngIf="!cargando">
        <!-- Panel lateral de parámetros -->
        <div class="sidebar">
          <div class="sidebar-section">
            <div class="section-header-with-actions">
              <h3>Parámetros de Inspección</h3>
              <div class="section-actions">
                <button class="action-btn add" (click)="abrirModalNuevoParametro()" title="Agregar parámetro">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="parametros-list">
              @for (param of parametros; track param.id) {
                <div class="parametro-item"
                     [class.dragging]="parametroArrastrado?.id === param.id"
                     [class.drag-over]="parametrosDragOverIndex === param.id"
                     draggable="true"
                     (dragstart)="onParametroDragStart($event, param, param.id)"
                     (dragover)="onParametroDragOver($event, param.id)"
                     (drop)="onParametroDrop($event, param.id)"
                     (dragend)="onParametroDragEnd()">
                  <div class="parametro-header">
                    <span class="parametro-nombre">{{ param.parametro }}</span>
                    <div class="parametro-actions">
                      <button class="parametro-action-btn edit" (click)="abrirModalEditarParametro(param)" title="Editar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button class="parametro-action-btn delete" (click)="eliminarParametro(param.id)" title="Eliminar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="parametro-descripcion">{{ param.observacion || 'Sin observación' }}</p>
                  <div class="parametro-meta" *ngIf="param.tipoEvaluacion">
                    <span class="parametro-tipo">{{ param.tipoEvaluacion }}</span>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p class="empty-message">No hay parámetros disponibles</p>
                  <button class="btn-create-parametro" (click)="abrirModalNuevoParametro()">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Crear primer parámetro
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Herramientas</h3>
            <div class="tools-list">
              <button class="tool-btn" (click)="agregarTexto()" title="Agregar texto">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"/>
                </svg>
                Texto
              </button>
              <button class="tool-btn" (click)="agregarImagen()" title="Agregar imagen">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Imagen
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Instrucciones</h3>
            <ul class="instructions">
              <li>Arrastra parámetros al canvas</li>
              <li>Haz clic en un elemento para seleccionarlo</li>
              <li>Usa los controles para mover/redimensionar</li>
              <li>Elimina con el botón eliminar</li>
            </ul>
          </div>
        </div>

        <!-- Canvas A4 horizontal -->
        <div class="canvas-area">
          <div class="canvas-wrapper">
            <div class="a4-canvas"
                 [style.width.px]="canvasWidth"
                 [style.height.px]="canvasHeight"
                 (mousedown)="onCanvasMouseDown($event)"
                 (mousemove)="onCanvasMouseMove($event)"
                 (mouseup)="onCanvasMouseUp($event)">

              @for (elemento of elementosCanvas; track elemento.id) {
                <div class="canvas-element"
                     [class.selected]="elementoSeleccionado?.id === elemento.id"
                     [style.left.px]="elemento.posicionX"
                     [style.top.px]="elemento.posicionY"
                     [style.width.px]="elemento.ancho"
                     [style.height.px]="elemento.alto"
                     [style.transform]="'rotate(' + elemento.rotacion + 'deg)'"
                     [style.z-index]="elemento.zIndex"
                     [style]="aplicarEstilos(elemento.estilo)"
                     (mousedown)="onElementoMouseDown($event, elemento)">

                  @if (elemento.tipoElemento === 'parametro') {
                    <div class="elemento-parametro">
                      <h4>{{ elemento.titulo }}</h4>
                      <p>{{ elemento.parametroInspeccion?.observacion || 'Sin observación' }}</p>
                    </div>
                  } @else if (elemento.tipoElemento === 'imagen') {
                    <img [src]="elemento.contenido" alt="Imagen" class="elemento-imagen">
                  } @else if (elemento.tipoElemento === 'texto') {
                    <div class="elemento-texto" contenteditable="true" (blur)="actualizarTexto(elemento, $event)">
                      {{ elemento.contenido || 'Haz clic para editar' }}
                    </div>
                  }

                  <!-- Controles de selección -->
                  @if (elementoSeleccionado?.id === elemento.id) {
                    <div class="elemento-controls">
                      <button class="control-btn resize" (mousedown)="startResize($event, elemento)" title="Redimensionar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                        </svg>
                      </button>
                      <button class="control-btn rotate" (click)="rotarElemento(elemento, $event)" title="Rotar 90°">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </button>
                      <button class="control-btn delete" (click)="eliminarElemento(elemento.id, $event)" title="Eliminar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="cargando-overlay" *ngIf="cargando">
        <div class="spinner"></div>
        <span class="loading-text">Cargando canvas...</span>
      </div>

      <!-- Notificación de guardado -->
      @if (mensajeGuardado) {
        <div class="notification {{ tipoNotificacion }}">
          {{ mensajeGuardado }}
        </div>
      }

      <!-- Modal de Parámetro -->
      @if (modalParametroAbierto) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ parametroEditando ? 'Editar Parámetro' : 'Nuevo Parámetro' }}</h2>
              <button class="modal-close" (click)="cerrarModal()">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="parametro-nombre">Nombre del Parámetro *</label>
                <input type="text"
                       id="parametro-nombre"
                       [(ngModel)]="nuevoParametro.parametro"
                       placeholder="Ej: Botiquín, Tarjeta de propiedad, Cinturón de seguridad"
                       class="form-input">
              </div>

            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button class="btn btn-primary" (click)="guardarParametro()">
                {{ parametroEditando ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .canvas-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
    }

    .canvas-header {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      color: #374151;
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.25rem;
      color: #111827;
    }

    .header-info p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn-accent {
      background: #10b981;
      color: white;
    }

    .btn-accent:hover {
      background: #059669;
    }

    .btn-accent:disabled {
      background: #6ee7b7;
      cursor: not-allowed;
    }

    .canvas-workspace {
      display: flex;
      flex: 1;
      overflow: auto;
      padding: 2rem;
      gap: 1.5rem;
    }

    .sidebar {
      width: 300px;
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-section h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }

    .parametros-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .parametro-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 0.75rem;
      cursor: move;
      transition: all 0.2s;
    }

    .parametro-item:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .parametro-item.dragging {
      opacity: 0.5;
    }

    .parametro-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .parametro-nombre {
      font-weight: 600;
      color: #111827;
      font-size: 0.875rem;
    }

    .parametro-descripcion {
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .tools-list {
      display: flex;
      gap: 0.5rem;
    }

    .tool-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.75rem;
      color: #374151;
      transition: all 0.2s;
    }

    .tool-btn:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .tool-btn svg {
      width: 24px;
      height: 24px;
    }

    .instructions {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.6;
    }

    .instructions li {
      margin-bottom: 0.5rem;
    }

    .canvas-area {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
    }

    .canvas-wrapper {
      background: #e5e7eb;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .a4-canvas {
      background: white;
      position: relative;
      box-shadow: 0 0 20px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    .canvas-element {
      position: absolute;
      cursor: move;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
      user-select: none;
    }

    .canvas-element:hover {
      border-color: #93c5fd;
    }

    .canvas-element.selected {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    }

    .elemento-parametro {
      width: 100%;
      height: 100%;
      padding: 0.5rem;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
    }

    .elemento-parametro h4 {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      color: #92400e;
      font-weight: 600;
    }

    .elemento-parametro p {
      margin: 0;
      font-size: 0.625rem;
      color: #78350f;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .elemento-imagen {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .elemento-texto {
      width: 100%;
      height: 100%;
      padding: 0.5rem;
      background: white;
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      overflow: auto;
      font-size: 0.875rem;
      outline: none;
    }

    .elemento-controls {
      position: absolute;
      top: -32px;
      right: 0;
      display: flex;
      gap: 0.25rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 0.25rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .control-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      color: #6b7280;
    }

    .control-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .control-btn.delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .control-btn svg {
      width: 16px;
      height: 16px;
    }

    .empty-message {
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
      padding: 2rem;
    }

    .notification {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
      z-index: 1000;
    }

    .notification.success {
      background: #10b981;
    }

    .notification.error {
      background: #ef4444;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .cargando-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #111827;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: #6b7280;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .modal-close svg {
      width: 24px;
      height: 24px;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      border-radius: 0 0 12px 12px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #111827;
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* Sidebar Section Header with Actions */
    .section-header-with-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header-with-actions h3 {
      margin: 0;
      font-size: 1rem;
      color: #374151;
      border-bottom: none;
      padding-bottom: 0;
    }

    .section-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      background: #f3f4f6;
      color: #6b7280;
    }

    .action-btn:hover {
      background: #e5e7eb;
      color: #111827;
    }

    .action-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Parametro Item Actions */
    .parametro-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .parametro-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .parametro-item:hover .parametro-actions {
      opacity: 1;
    }

    .parametro-action-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: transparent;
      color: #6b7280;
      transition: all 0.2s;
    }

    .parametro-action-btn.edit:hover {
      background: #dbeafe;
      color: #2563eb;
    }

    .parametro-action-btn.delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .parametro-action-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Drag and Drop Styles */
    .parametro-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 0.75rem;
      cursor: move;
      transition: all 0.2s;
      position: relative;
    }

    .parametro-item:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .parametro-item.dragging {
      opacity: 0.5;
      transform: scale(0.95);
    }

    .parametro-item.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
      border-style: dashed;
    }

    /* Parametro Meta */
    .parametro-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .parametro-tipo,
    .parametro-categoria {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      background: #e5e7eb;
      color: #6b7280;
      font-weight: 500;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
    }

    .btn-create-parametro {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.625rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-create-parametro:hover {
      background: #2563eb;
    }

    .btn-create-parametro svg {
      width: 18px;
      height: 18px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class CanvasInspeccionComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef;

  // Datos de la inspección
  inspeccionId: number = 0;
  inspeccion: InspeccionResponse | null = null;
  fichas: FichaInspeccionResponse[] = [];
  parametros: ParametroInspeccionResponse[] = [];

  // Gestión de parámetros
  modalParametroAbierto = false;
  parametroEditando: ParametroInspeccionResponse | null = null;
  nuevoParametro: {
    parametro: string;
  } = {
    parametro: ''
  };
  parametrosDisponibles: {id: number, parametro: string, observacion?: string}[] = [];
  cargandoParametrosDisponibles = false;

   // Canvas - A1 Vertical (841mm x 1189mm) a 96 DPI
   canvasWidth = 3170;  // 841 * 96 / 25.4 ≈ 3170 px
   canvasHeight = 4493; // 1189 * 96 / 25.4 ≈ 4493 px
   elementosCanvas: ElementoCanvas[] = [];
   elementoSeleccionado: ElementoCanvas | null = null;

   // Gestión de hojas
   hojaActual: number = 1;
   numeroTotalHojas: number = 1;

  // Estado
  cargando = false;
  guardando = false;
  mensajeGuardado: string = '';
  tipoNotificacion: 'success' | 'error' = 'success';

  // Drag & Drop manual
  parametroArrastrado: ParametroInspeccionResponse | null = null;
  draggingElemento: ElementoCanvas | null = null;
  dragOffsetX = 0;
  dragOffsetY = 0;

  // Resize
  resizingElemento: ElementoCanvas | null = null;
  resizeStartX = 0;
  resizeStartY = 0;
  resizeStartAncho = 0;
  resizeStartAlto = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inspeccionService: InspeccionService,
    private elementoCanvasService: ElementoCanvasService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inspeccionId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.inspeccionId === 0) {
      // Modo diseño: sin inspección asociada
      this.inspeccion = {
        id: 0,
        codigo: 'NUEVA',
        tipo: '',
        fechaProgramada: new Date(),
        horaProgramada: '',
        lugar: '',
        empresaNombre: 'Modo Diseño - Nueva Ficha',
        vehiculoPlaca: '',
        inspectorNombre: '',
        estado: 'programada',
        expedienteId: 0,
        empresaId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      } as InspeccionResponse;
      this.fichas = [];
      this.elementosCanvas = [];
      this.cargarParametros();
    } else if (this.inspeccionId) {
      this.cargarDatos();
    } else {
      this.notificationService.error('ID de inspección no válido');
      this.router.navigate(['/inspecciones']);
    }
  }

  ngOnDestroy(): void {
    // Limpiar event listeners si es necesario
  }

  cargarDatos(): void {
    this.cargando = true;

    // Cargar inspección
    this.inspeccionService.obtener(this.inspeccionId).subscribe({
      next: (data) => {
        this.inspeccion = data;
        this.cargarFichas();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error al cargar la inspección';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error cargando inspección:', err);
        this.cargando = false;
      }
    });
  }

  cargarFichas(): void {
    this.inspeccionService.obtenerFichas(this.inspeccionId).subscribe({
      next: (fichas) => {
        this.fichas = fichas;
        if (this.fichas.length > 0) {
          // Cargar canvas de la primera ficha
          this.cargarCanvas(this.fichas[0].id);
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error al cargar las fichas de inspección';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error cargando fichas:', err);
        this.cargando = false;
      }
    });
  }

  cargarCanvas(fichaId: number): void {
    this.elementoCanvasService.obtenerElementosPorFicha(fichaId).subscribe({
      next: (elementos) => {
        // Filtrar elementos por hoja actual
        this.elementosCanvas = elementos.filter(e => e.numeroHoja === this.hojaActual);
        
        // Calcular número total de hojas (máximo numeroHoja encontrado)
        if (elementos.length > 0) {
          this.numeroTotalHojas = Math.max(...elementos.map(e => e.numeroHoja));
        } else {
          this.numeroTotalHojas = 1;
        }
        
        // Asegurar que hojaActual esté dentro del rango
        if (this.hojaActual > this.numeroTotalHojas) {
          this.hojaActual = this.numeroTotalHojas;
        }
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Error al cargar los elementos del canvas';
        this.notificationService.error(errorMessage, 'Error', 5000);
        console.error('Error cargando canvas:', err);
        this.cargando = false;
      }
    });
  }

  cargarParametros(): void {
    this.inspeccionService.listarParametros().subscribe({
      next: (params) => {
        this.parametros = params;
      },
      error: (err) => {
        console.error('Error cargando parámetros:', err);
      }
    });
  }

  cargarParametrosDisponibles(): void {
    this.cargandoParametrosDisponibles = true;
    this.inspeccionService.obtenerParametrosDisponibles().subscribe({
      next: (disponibles) => {
        this.parametrosDisponibles = disponibles;
        this.cargandoParametrosDisponibles = false;
      },
      error: (err) => {
        console.error('Error cargando parámetros disponibles:', err);
        this.cargandoParametrosDisponibles = false;
      }
    });
  }

  // Drag & Drop manual de parámetros
  startDragParametro(event: MouseEvent, parametro: ParametroInspeccionResponse): void {
    event.preventDefault();
    this.parametroArrastrado = parametro;

    const handleMouseMove = (e: MouseEvent) => {
      // Podemos mostrar un preview si queremos
    };

    const handleMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      if (this.parametroArrastrado) {
        const canvas = document.querySelector('.a4-canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            this.crearElementoParametro(this.parametroArrastrado, x, y);
          }
        }
        this.parametroArrastrado = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  crearElementoParametro(parametro: ParametroInspeccionResponse, x: number, y: number): void {
    if (!this.fichas.length) {
      this.notificationService.error('No hay ficha activa', 'Error', 3000);
      return;
    }

    const fichaId = this.fichas[0].id;

    const dto = {
      tipoElemento: 'parametro',
      titulo: parametro.parametro,
      contenido: parametro.observacion || '',
      posicionX: Math.round(x - 100), // Centrar aproximadamente
      posicionY: Math.round(y - 50),
      ancho: 200,
      alto: 100,
       rotacion: 0,
       zIndex: this.elementosCanvas.length,
       numeroHoja: this.hojaActual,
       estilo: JSON.stringify({
         backgroundColor: '#fef3c7',
         border: '1px solid #fbbf24',
         borderRadius: '4px',
         padding: '8px',
         fontSize: '12px',
         color: '#92400e'
       }),
       parametroInspeccionId: parametro.id
     };

    this.elementoCanvasService.crearElemento(fichaId, dto).subscribe({
      next: (elemento) => {
        this.elementosCanvas.push(elemento);
        this.notificationService.success('Parámetro añadido al canvas', 'Éxito', 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Error al añadir parámetro', 'Error', 3000);
      }
    });
  }

  // Herramientas
  agregarTexto(): void {
    if (!this.fichas.length) {
      this.notificationService.error('No se pueden agregar elementos en modo diseño. Primero debe crear o seleccionar una ficha de inspección.', 'Error', 4000);
      return;
    }

    const fichaId = this.fichas[0].id;
    const centroX = this.canvasWidth / 2 - 100;
    const centroY = this.canvasHeight / 2 - 25;

    const dto = {
      tipoElemento: 'texto',
      titulo: 'Texto',
      contenido: 'Haz clic para editar',
      posicionX: Math.round(centroX),
      posicionY: Math.round(centroY),
      ancho: 200,
      alto: 50,
       rotacion: 0,
       zIndex: this.elementosCanvas.length,
       numeroHoja: this.hojaActual,
       estilo: JSON.stringify({
         backgroundColor: 'white',
         border: '1px dashed #d1d5db',
         borderRadius: '4px',
         padding: '8px',
         fontSize: '14px',
         color: '#374151'
       })
     };

    this.elementoCanvasService.crearElemento(fichaId, dto).subscribe({
      next: (elemento) => {
        this.elementosCanvas.push(elemento);
        this.notificationService.success('Texto añadido', 'Éxito', 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Error al añadir texto', 'Error', 3000);
      }
    });
  }

  agregarImagen(): void {
    if (!this.fichas.length) {
      this.notificationService.error('No se pueden agregar imágenes en modo diseño. Primero debe crear o seleccionar una ficha de inspección.', 'Error', 4000);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.subirImagen(file);
      }
    };
    input.click();
  }

  subirImagen(file: File): void {
    if (!this.fichas.length) {
      this.notificationService.error('No hay ficha activa', 'Error', 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      const fichaId = this.fichas[0].id;
      const centroX = this.canvasWidth / 2 - 100;
      const centroY = this.canvasHeight / 2 - 100;

      const dto = {
        tipoElemento: 'imagen',
        titulo: 'Imagen',
        contenido: base64,
        posicionX: Math.round(centroX),
        posicionY: Math.round(centroY),
        ancho: 200,
        alto: 200,
       rotacion: 0,
       zIndex: this.elementosCanvas.length,
       numeroHoja: this.hojaActual,
       estilo: JSON.stringify({
         border: '1px solid #d1d5db',
         borderRadius: '4px'
       })
     };

      this.elementoCanvasService.crearElemento(fichaId, dto).subscribe({
        next: (elemento) => {
          this.elementosCanvas.push(elemento);
          this.notificationService.success('Imagen subida correctamente', 'Éxito', 2000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('Error al subir imagen', 'Error', 3000);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  // Manipulación de elementos
  onElementoMouseDown(event: MouseEvent, elemento: ElementoCanvas): void {
    event.stopPropagation();
    this.seleccionarElemento(elemento);

    if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('elemento-parametro') ||
        (event.target as HTMLElement).classList.contains('elemento-texto') ||
        (event.target as HTMLElement).tagName === 'IMG') {
      this.draggingElemento = elemento;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.dragOffsetX = event.clientX - rect.left;
      this.dragOffsetY = event.clientY - rect.top;
    }
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.elementoSeleccionado = null;
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (this.draggingElemento) {
      const canvas = document.querySelector('.a4-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        let newX = event.clientX - rect.left - this.dragOffsetX;
        let newY = event.clientY - rect.top - this.dragOffsetY;

        // Limitar al canvas
        newX = Math.max(0, Math.min(newX, this.canvasWidth - this.draggingElemento.ancho));
        newY = Math.max(0, Math.min(newY, this.canvasHeight - this.draggingElemento.alto));

        this.draggingElemento.posicionX = Math.round(newX);
        this.draggingElemento.posicionY = Math.round(newY);
        this.cdr.detectChanges();
      }
    }

    if (this.resizingElemento) {
      const deltaX = event.clientX - this.resizeStartX;
      const deltaY = event.clientY - this.resizeStartY;

      this.resizingElemento.ancho = Math.max(50, this.resizeStartAncho + deltaX);
      this.resizingElemento.alto = Math.max(50, this.resizeStartAlto + deltaY);
      this.cdr.detectChanges();
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this.draggingElemento) {
      this.guardarPosicion(this.draggingElemento);
      this.draggingElemento = null;
    }

    if (this.resizingElemento) {
      this.guardarPosicion(this.resizingElemento);
      this.resizingElemento = null;
    }
  }

  seleccionarElemento(elemento: ElementoCanvas): void {
    this.elementoSeleccionado = elemento;
  }

  startResize(event: MouseEvent, elemento: ElementoCanvas): void {
    event.stopPropagation();
    this.resizingElemento = elemento;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartAncho = elemento.ancho;
    this.resizeStartAlto = elemento.alto;
  }

  rotarElemento(elemento: ElementoCanvas, event: MouseEvent): void {
    event.stopPropagation();
    elemento.rotacion = (elemento.rotacion + 90) % 360;
    this.guardarPosicion(elemento);
  }

  actualizarTexto(elemento: ElementoCanvas, event: Event): void {
    const nuevoTexto = (event.target as HTMLElement).innerText;
    elemento.contenido = nuevoTexto;
    this.guardarPosicion(elemento);
  }

  eliminarElemento(elementoId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('¿Eliminar este elemento del canvas?')) return;

    this.elementoCanvasService.eliminarElemento(elementoId).subscribe({
      next: () => {
        this.elementosCanvas = this.elementosCanvas.filter(e => e.id !== elementoId);
        if (this.elementoSeleccionado?.id === elementoId) {
          this.elementoSeleccionado = null;
        }
        this.notificationService.success('Elemento eliminado', 'Éxito', 2000);
      },
      error: (err) => {
        this.notificationService.error('Error al eliminar elemento', 'Error', 3000);
      }
    });
  }

  guardarPosicion(elemento: ElementoCanvas): void {
    if (!this.fichas.length) return;

    const dto = {
      posicionX: elemento.posicionX,
      posicionY: elemento.posicionY,
      ancho: elemento.ancho,
      alto: elemento.alto,
      rotacion: elemento.rotacion,
      zIndex: elemento.zIndex,
      estilo: elemento.estilo,
      titulo: elemento.titulo,
      contenido: elemento.contenido
    };

    this.elementoCanvasService.actualizarElemento(elemento.id, dto).subscribe({
      error: (err) => {
        this.notificationService.error('Error al guardar posición', 'Error', 3000);
      }
    });
  }

  guardarCanvas(): void {
    if (this.guardando) return;

    this.guardando = true;
    this.mensajeGuardado = 'Guardando...';
    this.tipoNotificacion = 'success';

    // Simular guardado (todos los elementos ya están guardados individualmente)
    setTimeout(() => {
      this.guardando = false;
      this.mensajeGuardado = 'Canvas guardado correctamente';
      setTimeout(() => {
        this.mensajeGuardado = '';
      }, 3000);
    }, 1000);
  }

  limpiarCanvas(): void {
    if (!this.fichas.length) return;

    if (!confirm('¿Estás seguro de limpiar el canvas? Se eliminarán todos los elementos.')) return;

    const fichaId = this.fichas[0].id;

    this.elementoCanvasService.eliminarTodosLosElementos(fichaId).subscribe({
      next: () => {
        this.elementosCanvas = [];
        this.elementoSeleccionado = null;
        this.notificationService.success('Canvas limpiado', 'Éxito', 2000);
      },
      error: (err) => {
        this.notificationService.error('Error al limpiar canvas', 'Error', 3000);
      }
    });
 }

 // ========== GESTIÓN DE PARÁMETROS ==========

  abrirModalNuevoParametro(): void {
    this.parametroEditando = null;
    this.nuevoParametro = {
      parametro: ''
    };
    this.modalParametroAbierto = true;
    this.cargarParametrosDisponibles();
  }

  abrirModalEditarParametro(parametro: ParametroInspeccionResponse): void {
    this.parametroEditando = { ...parametro };
    this.nuevoParametro = {
      parametro: parametro.parametro
    };
    this.modalParametroAbierto = true;
  }

 cerrarModal(): void {
   this.modalParametroAbierto = false;
   this.parametroEditando = null;
 }

 guardarParametro(): void {
   if (!this.nuevoParametro.parametro.trim()) {
     this.notificationService.error('El nombre del parámetro es requerido', 'Error', 3000);
     return;
   }

   if (this.parametroEditando) {
     // Actualizar parámetro existente
     this.inspeccionService.actualizarParametro(this.parametroEditando.id, this.nuevoParametro).subscribe({
       next: () => {
         this.notificationService.success('Parámetro actualizado correctamente', 'Éxito', 2000);
         this.cerrarModal();
         this.recargarParametros();
       },
       error: (err) => {
         const errorMessage = err.error?.message || err.message || 'Error al actualizar parámetro';
         this.notificationService.error(errorMessage, 'Error', 3000);
       }
     });
   } else {
     // Crear nuevo parámetro
     this.inspeccionService.crearParametro(0, this.nuevoParametro).subscribe({
       next: () => {
         this.notificationService.success('Parámetro creado correctamente', 'Éxito', 2000);
         this.cerrarModal();
         this.recargarParametros();
       },
       error: (err) => {
         const errorMessage = err.error?.message || err.message || 'Error al crear parámetro';
         this.notificationService.error(errorMessage, 'Error', 3000);
       }
     });
   }
 }

 eliminarParametro(parametroId: number): void {
   if (!confirm('¿Eliminar este parámetro? Esta acción no se puede deshacer.')) return;

   this.inspeccionService.eliminarParametro(parametroId).subscribe({
     next: () => {
       this.notificationService.success('Parámetro eliminado correctamente', 'Éxito', 2000);
       this.parametros = this.parametros.filter(p => p.id !== parametroId);
     },
     error: (err) => {
       const errorMessage = err.error?.message || err.message || 'Error al eliminar parámetro';
       this.notificationService.error(errorMessage, 'Error', 3000);
     }
   });
 }

  recargarParametros(): void {
    this.cargarParametros();
  }

  // ========== GESTIÓN DE HOJAS ==========

  cambiarHoja(hoja: number): void {
    if (hoja < 1 || hoja > this.numeroTotalHojas) return;
    this.hojaActual = hoja;
    // Recargar canvas para filtrar por la nueva hoja
    if (this.fichas.length > 0) {
      this.cargarCanvas(this.fichas[0].id);
    }
  }

  siguienteHoja(): void {
    if (this.hojaActual < this.numeroTotalHojas) {
      this.cambiarHoja(this.hojaActual + 1);
    }
  }

  anteriorHoja(): void {
    if (this.hojaActual > 1) {
      this.cambiarHoja(this.hojaActual - 1);
    }
  }

  agregarNuevaHoja(): void {
    if (!this.fichas || this.fichas.length === 0) {
      this.notificationService.error('Debe tener una ficha activa para agregar hojas', 'Error', 3000);
      return;
    }

    const fichaId = this.fichas[0].id;
    const nuevaHoja = this.numeroTotalHojas + 1;
    this.hojaActual = nuevaHoja;
    this.numeroTotalHojas = nuevaHoja;
    
    // No se crean elementos automáticamente, solo se cambia a la nueva hoja vacía
    this.elementosCanvas = [];
    this.notificationService.success(`Hoja ${nuevaHoja} creada`, 'Éxito', 2000);
  }

  eliminarHojaActual(): void {
    if (this.numeroTotalHojas <= 1) {
      this.notificationService.error('No se puede eliminar la única hoja', 'Error', 3000);
      return;
    }

    if (!confirm(`¿Eliminar hoja ${this.hojaActual}? Se eliminarán todos los elementos de esta hoja.`)) {
      return;
    }

    const fichaId = this.fichas[0].id;
    const elementosAEliminar = this.elementosCanvas.filter(e => e.numeroHoja === this.hojaActual);
    
    // Eliminar cada elemento de esta hoja
    const eliminarPromises = elementosAEliminar.map(e => 
      this.elementoCanvasService.eliminarElemento(e.id).toPromise()
    );

    Promise.all(eliminarPromises)
      .then(() => {
        // Ajustar números de hoja de elementos superiores
        this.elementoCanvasService.obtenerElementosPorFicha(fichaId).subscribe({
          next: (todos) => {
            // Recalcular total de hojas
            if (todos.length > 0) {
              this.numeroTotalHojas = Math.max(...todos.map(e => e.numeroHoja));
            } else {
              this.numeroTotalHojas = 1;
            }
            
            // Si eliminamos la hoja actual, ir a la primera
            if (this.hojaActual > this.numeroTotalHojas) {
              this.hojaActual = this.numeroTotalHojas;
            }
            
            // Recargar canvas
            this.cargarCanvas(fichaId);
            this.notificationService.success(`Hoja ${this.hojaActual} eliminada`, 'Éxito', 2000);
          },
          error: (err) => {
            this.notificationService.error('Error al recargar canvas', 'Error', 3000);
          }
        });
      })
      .catch((err) => {
        this.notificationService.error('Error al eliminar elementos', 'Error', 3000);
      });
  }

  // Drag & Drop para reordenar parámetros
 parametrosDragStart: ParametroInspeccionResponse | null = null;
 parametrosDragOverIndex: number | null = null;

 onParametroDragStart(event: DragEvent, parametro: ParametroInspeccionResponse, index: number): void {
   this.parametrosDragStart = parametro;
   this.parametrosDragOverIndex = index;
   if (event.dataTransfer) {
     event.dataTransfer.effectAllowed = 'move';
     event.dataTransfer.setData('text/plain', index.toString());
   }
 }

 onParametroDragOver(event: DragEvent, index: number): void {
   event.preventDefault();
   if (event.dataTransfer) {
     event.dataTransfer.dropEffect = 'move';
   }
   this.parametrosDragOverIndex = index;
 }

 onParametroDrop(event: DragEvent, dropIndex: number): void {
   event.preventDefault();
   
   if (!this.parametrosDragStart) return;

   const dragIndex = this.parametros.findIndex(p => p.id === this.parametrosDragStart!.id);
   if (dragIndex === dropIndex) return;

   // Reordenar array
   const newParametros = [...this.parametros];
   newParametros.splice(dragIndex, 1);
   newParametros.splice(dropIndex, 0, this.parametrosDragStart);

   // Nota: El orden se maneja visualmente en el frontend.
   // Si se necesita persistir, se debería agregar campo 'orden' en el backend.

   this.parametros = newParametros;
   this.parametrosDragStart = null;
   this.parametrosDragOverIndex = null;

   // TODO: Guardar nuevo orden en backend si es necesario
   this.notificationService.success('Orden actualizado', 'Éxito', 2000);
 }

 onParametroDragEnd(): void {
   this.parametrosDragStart = null;
   this.parametrosDragOverIndex = null;
 }

 volver(): void {
    if (this.inspeccionId === 0) {
      this.router.navigate(['/inspecciones']);
    } else {
      this.router.navigate(['/inspecciones', this.inspeccionId]);
    }
  }

  aplicarEstilos(estiloJson?: string): any {
    if (!estiloJson) return {};

    try {
      const estilo = JSON.parse(estiloJson);
      return {
        ...estilo,
        position: 'absolute' as const,
        left: '0px',
        top: '0px'
      };
    } catch (e) {
      return {};
    }
  }
}