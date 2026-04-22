import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'textarea' | 'number';
  inputRequired?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="dialog-overlay" (click)="onCancel()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="dialog-header" [class]="'dialog-header--' + data.type">
            @if (data.type === 'warning') {
              <span class="icon warning">⚠️</span>
            } @else if (data.type === 'danger') {
              <span class="icon danger">🛑</span>
            } @else if (data.type === 'success') {
              <span class="icon success">✅</span>
            } @else {
              <span class="icon info">ℹ️</span>
            }
            <h3>{{ data.title }}</h3>
          </div>

          <!-- Body -->
          <div class="dialog-body">
            <p>{{ data.message }}</p>
            
            @if (data.showInput) {
              <div class="input-container">
                <label>{{ data.inputLabel }}</label>
                @if (data.inputType === 'textarea') {
                  <textarea 
                    [placeholder]="data.inputPlaceholder"
                    [(ngModel)]="inputValue"
                    [required]="data.inputRequired"
                    class="dialog-input"
                    rows="3">
                  </textarea>
                } @else {
                  <input 
                    [type]="data.inputType || 'text'"
                    [placeholder]="data.inputPlaceholder"
                    [(ngModel)]="inputValue"
                    [required]="data.inputRequired"
                    class="dialog-input">
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="dialog-footer">
            <button 
              class="btn btn-secondary"
              (click)="onCancel()">
              {{ data.cancelText || 'Cancelar' }}
            </button>
            <button 
              class="btn"
              [class]="'btn--' + (data.type === 'danger' ? 'danger' : 'primary')"
              (click)="onConfirm()"
              [disabled]="data.showInput && data.inputRequired && !inputValue">
              {{ data.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 480px;
      width: 90%;
      overflow: hidden;
    }

    .dialog-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .dialog-header .icon {
      font-size: 24px;
    }

    .dialog-header--info {
      background-color: #eff6ff;
      color: #1e40af;
    }

    .dialog-header--warning {
      background-color: #fefce8;
      color: #854d0e;
    }

    .dialog-header--danger {
      background-color: #fef2f2;
      color: #991b1b;
    }

    .dialog-header--success {
      background-color: #f0fdf4;
      color: #166534;
    }

    .dialog-body {
      padding: 20px;
    }

    .dialog-body p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }

    .input-container {
      margin-top: 16px;
    }

    .input-container label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #374151;
    }

    .dialog-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .dialog-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .dialog-footer {
      padding: 16px 20px;
      background-color: #f9fafb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn--primary {
      background-color: #3b82f6;
      color: white;
      border: none;
    }

    .btn--primary:hover {
      background-color: #2563eb;
    }

    .btn--danger {
      background-color: #dc2626;
      color: white;
      border: none;
    }

    .btn--danger:hover {
      background-color: #b91c1c;
    }

    .btn-secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background-color: #f9fafb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() id: string = 'confirm-dialog';
  @Output() confirm = new EventEmitter<string | null>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = false;
  data: ConfirmDialogData = {
    title: '',
    message: '',
    type: 'info'
  };
  inputValue: string = '';

  open(data: ConfirmDialogData): void {
    this.data = {
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      showInput: false,
      inputType: 'text',
      inputRequired: false,
      ...data
    };
    this.inputValue = '';
    this.isOpen = true;
  }

  onConfirm(): void {
    this.confirm.emit(this.data.showInput ? this.inputValue : null);
    this.isOpen = false;
  }

  onCancel(): void {
    this.cancel.emit();
    this.isOpen = false;
  }
}
