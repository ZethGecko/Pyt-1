import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FileUploadConfig {
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  uploadUrl?: string;
  autoUpload?: boolean;
}

export interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt?: Date;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="file-upload-container">
      
      <!-- Área de arrastre -->
      <div 
        class="drop-zone"
        [class.drag-over]="isDragOver"
        [class.disabled]="disabled || (maxFiles > 0 && files.length >= maxFiles)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file"
          [multiple]="config?.maxFiles ? config!.maxFiles > 1 : true"
          [accept]="config?.accept || '*'"
          (change)="onFileSelect($event)"
          [disabled]="disabled || (maxFiles > 0 && files.length >= maxFiles)"
          hidden>
        
        <div class="drop-zone-content">
          <span class="icon">📁</span>
          <p class="text">
            @if (config?.maxFiles && config!.maxFiles > 1) {
              Arrastra archivos aquí o haz clic para seleccionar
            } @else {
              Arrastra un archivo aquí o haz clic para seleccionar
            }
          </p>
          <p class="hint">
            @if (config?.maxSizeMB) {
              Máximo {{ config!.maxSizeMB }}MB
            }
            @if (config?.maxFiles && config!.maxFiles > 1) {
               • Máximo {{ config!.maxFiles }} archivos
            }
            @if (config?.accept) {
               • Formatos: {{ config!.accept }}
            }
          </p>
        </div>
      </div>

      <!-- Lista de archivos -->
      @if (files.length > 0) {
        <div class="files-list">
          @for (file of files; track file.name; let i = $index) {
            <div class="file-item" [class]="'file-item--' + file.status">
              
              <!-- Icono del archivo -->
              <div class="file-icon">
                @if (file.type.includes('image')) {
                  🖼️
                } @else if (file.type.includes('pdf')) {
                  📄
                } @else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                  📝
                } @else {
                  📎
                }
              </div>

              <!-- Info del archivo -->
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                
                @if (file.status === 'uploading') {
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="file.progress || 0"></div>
                  </div>
                }
                
                @if (file.status === 'error') {
                  <span class="file-error">{{ file.error }}</span>
                }
              </div>

              <!-- Acciones -->
              <div class="file-actions">
                @if (file.status === 'success') {
                  <button class="btn-icon" (click)="downloadFile(file)" title="Descargar">
                    ⬇️
                  </button>
                }
                <button 
                  class="btn-icon remove"
                  (click)="removeFile(i)"
                  [disabled]="file.status === 'uploading'"
                  title="Eliminar">
                  ✕
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Botón de subir (si no es auto-upload) -->
      @if (files.length > 0 && !config?.autoUpload && !isUploading) {
        <button 
          class="btn btn-primary upload-btn"
          (click)="uploadFiles()"
          [disabled]="files.length === 0 || hasErrors">
          Subir Archivos
        </button>
      }

      <!-- Loading -->
      @if (isUploading) {
        <div class="uploading-overlay">
          <span class="spinner"></span>
          <span>Subiendo archivos...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .file-upload-container {
      position: relative;
    }

    .drop-zone {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background-color: #f9fafb;
    }

    .drop-zone:hover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .drop-zone.drag-over {
      border-color: #3b82f6;
      background-color: #dbeafe;
    }

    .drop-zone.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .drop-zone-content {
      pointer-events: none;
    }

    .drop-zone .icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }

    .drop-zone .text {
      font-size: 16px;
      color: #374151;
      margin: 0 0 8px;
    }

    .drop-zone .hint {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    .files-list {
      margin-top: 16px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .file-item--error {
      border-color: #fca5a5;
      background-color: #fef2f2;
    }

    .file-item--success {
      border-color: #86efac;
      background-color: #f0fdf4;
    }

    .file-icon {
      font-size: 24px;
      width: 40px;
      text-align: center;
    }

    .file-info {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: 12px;
      color: #6b7280;
    }

    .progress-bar {
      margin-top: 6px;
      height: 4px;
      background-color: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #3b82f6;
      transition: width 0.2s;
    }

    .file-error {
      display: block;
      font-size: 12px;
      color: #dc2626;
      margin-top: 4px;
    }

    .file-actions {
      display: flex;
      gap: 4px;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background-color: transparent;
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-icon:hover {
      background-color: #f3f4f6;
    }

    .btn-icon.remove:hover {
      background-color: #fee2e2;
    }

    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .upload-btn {
      margin-top: 12px;
      width: 100%;
    }

    .uploading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-radius: 12px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class FileUploadComponent {
  @Input() config?: FileUploadConfig;
  @Input() disabled = false;
  @Output() filesChange = new EventEmitter<UploadedFile[]>();
  @Output() uploadComplete = new EventEmitter<UploadedFile[]>();

  files: UploadedFile[] = [];
  isDragOver = false;
  isUploading = false;

  get maxFiles(): number {
    return this.config?.maxFiles || 0;
  }

  get hasErrors(): boolean {
    return this.files.some(f => f.status === 'error');
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

    if (this.disabled) return;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.processFiles(Array.from(droppedFiles));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
    input.value = '';
  }

  private processFiles(fileList: File[]): void {
    const maxSizeMB = this.config?.maxSizeMB || 10;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const availableSlots = this.maxFiles > 0 ? this.maxFiles - this.files.length : fileList.length;

    const filesToAdd = fileList.slice(0, availableSlots);

    for (const file of filesToAdd) {
      // Validar tamaño
      if (file.size > maxBytes) {
        this.files.push({
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'error',
          error: `Archivo demasiado grande. Máximo ${maxSizeMB}MB`
        });
        continue;
      }

      // Agregar archivo
      this.files.push({
        name: file.name,
        size: file.size,
        type: file.type,
        status: this.config?.autoUpload ? 'uploading' : 'pending',
        progress: 0
      });

      // Si es auto-upload, iniciar subida
      if (this.config?.autoUpload) {
        this.simulateUpload(this.files.length - 1);
      }
    }

    this.emitFiles();
  }

  private simulateUpload(index: number): void {
    const file = this.files[index];
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Simular éxito/error (90% éxito)
        file.status = Math.random() > 0.1 ? 'success' : 'error';
        if (file.status === 'error') {
          file.error = 'Error al subir el archivo';
        }
        file.uploadedAt = new Date();
        
        this.emitFiles();
        if (this.files.every(f => f.status !== 'uploading')) {
          this.uploadComplete.emit(this.files.filter(f => f.status === 'success'));
        }
      }
      file.progress = progress;
    }, 200);
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.emitFiles();
  }

  downloadFile(file: UploadedFile): void {
    // Implementar descarga
    console.log('Download:', file);
  }

  uploadFiles(): void {
    this.isUploading = true;
    
    this.files.forEach((file, index) => {
      if (file.status === 'pending' || file.status === 'error') {
        file.status = 'uploading';
        file.progress = 0;
        this.simulateUpload(index);
      }
    });
  }

  private emitFiles(): void {
    this.filesChange.emit(this.files);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
