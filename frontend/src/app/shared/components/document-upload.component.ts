import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: SafeResourceUrl;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Drop Zone -->
      <div class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
           [class.border-blue-400]="isDragging"
           [class.border-gray-300]="!isDragging"
           [class.bg-blue-50]="isDragging"
           [class.bg-gray-50]="!isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <div class="space-y-2">
          <div class="text-4xl">📁</div>
          <p class="text-sm text-gray-600">
            Arrastra y suelta archivos aquí o
            <button type="button"
                    (click)="fileInput.click()"
                    class="text-blue-600 hover:text-blue-800 font-medium">
              explora
            </button>
          </p>
          <p class="text-xs text-gray-500">
            PDF, DOC, DOCX, JPG, PNG (max. 10MB)
          </p>
        </div>
        
        <input #fileInput
               type="file"
               class="hidden"
               [multiple]="multiple"
               [accept]="acceptedTypes"
               (change)="onFileSelected($event)">
      </div>
      
      <!-- File List -->
      @if (files.length > 0) {
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">
            Archivos seleccionados ({{ files.length }})
          </h4>
          
          <div class="space-y-2">
            @for (file of files; track file.id) {
              <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div class="flex items-center space-x-3">
                  <!-- File Icon -->
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                       [class.bg-red-100]="file.type.includes('pdf')"
                       [class.bg-blue-100]="file.type.includes('image')"
                       [class.bg-green-100]="file.type.includes('word') || file.type.includes('document')"
                       [class.bg-gray-100]="!file.type.includes('pdf') && !file.type.includes('image') && !file.type.includes('word') && !file.type.includes('document')">
                    <span class="text-lg">
                      {{ getFileIcon(file.type) }}
                    </span>
                  </div>
                  
                  <!-- File Info -->
                  <div>
                    <p class="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {{ file.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatFileSize(file.size) }}
                      @if (file.status === 'uploading') {
                        • Subiendo...
                      }
                      @if (file.status === 'completed') {
                        • Subido
                      }
                      @if (file.status === 'error') {
                        • Error: {{ file.error }}
                      }
                    </p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <!-- Progress -->
                  @if (file.status === 'uploading') {
                    <div class="w-8 h-8 relative">
                      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  }
                  
                  <!-- Download/View -->
                  @if (file.status === 'completed' && file.url) {
                    <button type="button"
                            (click)="viewFile(file)"
                            class="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Ver archivo">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  }
                  
                  <!-- Remove -->
                  <button type="button"
                          (click)="removeFile(file)"
                          [disabled]="file.status === 'uploading'"
                          class="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar archivo">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
      
      <!-- Upload Button -->
      @if (files.length > 0 && !autoUpload) {
        <div class="flex justify-end">
          <button type="button"
                  (click)="uploadAll()"
                  [disabled]="isUploading || files.every(f => f.status === 'completed')"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            @if (isUploading) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            Subir Archivos
          </button>
        </div>
      }
    </div>
  `
})
export class DocumentUploadComponent implements OnInit {
  @Input() multiple = true;
  @Input() maxSizeMB = 10;
  @Input() acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  @Input() autoUpload = false;
  @Input() tramiteId: number | null = null;
  
  @Output() filesUploaded = new EventEmitter<UploadedFile[]>();
  @Output() fileRemoved = new EventEmitter<UploadedFile>();
  @Output() uploadProgress = new EventEmitter<number>();
  
  files: UploadedFile[] = [];
  isDragging = false;
  isUploading = false;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {}
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }
  
  handleFiles(fileList: FileList): void {
    const newFiles: File[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate size
      if (file.size > this.maxSizeMB * 1024 * 1024) {
        alert(`El archivo "${file.name}" excede el tamaño máximo de ${this.maxSizeMB}MB`);
        continue;
      }
      
      // Validate type
      const validTypes = this.acceptedTypes.split(',').map(t => t.trim().replace('.', ''));
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidType = validTypes.some(type => 
        file.type.includes(type) || type.includes(fileExtension)
      );
      
      if (!isValidType) {
        alert(`El archivo "${file.name}" no es un tipo válido`);
        continue;
      }
      
      newFiles.push(file);
    }
    
    // Add to list
    newFiles.forEach(file => {
      const uploadedFile: UploadedFile = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading'
      };
      this.files.push(uploadedFile);
      
      // Simulate upload if autoUpload
      if (this.autoUpload) {
        this.uploadFile(uploadedFile, file);
      }
    });
    
    if (!this.autoUpload) {
      this.filesUploaded.emit(this.files);
    }
  }
  
  uploadFile(file: UploadedFile, sourceFile: File): void {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress.emit(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        file.status = 'completed';
        
        // Create URL for preview
        const url = URL.createObjectURL(sourceFile);
        file.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        
        this.filesUploaded.emit([file]);
      }
    }, 200);
  }
  
  uploadAll(): void {
    this.isUploading = true;
    const filesToUpload = this.files.filter(f => f.status !== 'completed');
    
    filesToUpload.forEach((file, index) => {
      // In a real app, you would upload to server here
      setTimeout(() => {
        file.status = 'completed';
        
        if (index === filesToUpload.length - 1) {
          this.isUploading = false;
          this.filesUploaded.emit(this.files.filter(f => f.status === 'completed'));
        }
      }, (index + 1) * 500);
    });
  }
  
  removeFile(file: UploadedFile): void {
    const index = this.files.findIndex(f => f.id === file.id);
    if (index > -1) {
      this.files.splice(index, 1);
      this.fileRemoved.emit(file);
    }
  }
  
  viewFile(file: UploadedFile): void {
    if (file.url) {
      window.open(file.url as string, '_blank');
    }
  }
  
  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
