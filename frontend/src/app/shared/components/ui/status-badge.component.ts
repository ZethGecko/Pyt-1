import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeConfig {
  label: string;
  type: BadgeType;
  icon?: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="status-badge"
      [class]="'status-badge--' + type + ' status-badge--' + size"
      [class.with-icon]="icon">
      @if (icon) {
        <span class="icon">{{ icon }}</span>
      }
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-badge--sm {
      padding: 2px 6px;
      font-size: 10px;
    }

    .status-badge--md {
      padding: 4px 10px;
      font-size: 12px;
    }

    .status-badge--lg {
      padding: 6px 14px;
      font-size: 14px;
    }

    /* Estados de trámite */
    .status-badge--success,
    .status-badge--aprobado,
    .status-badge--vigente {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .status-badge--warning,
    .status-badge--pendiente,
    .status-badge--observado,
    .status-badge--en_revision {
      background-color: #fef9c3;
      color: #854d0e;
      border: 1px solid #fde047;
    }

    .status-badge--danger,
    .status-badge--rechazado,
    .status-badge--cancelado,
    .status-badge--vencido {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .status-badge--info,
    .status-badge--derivado,
    .status-badge--registrado {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }

    .status-badge--default,
    .status-badge--finalizado {
      background-color: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .status-badge--primary {
      background-color: #e0e7ff;
      color: #3730a3;
      border: 1px solid #a5b4fc;
    }

    .icon {
      font-size: 14px;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() label: string = '';
  @Input() type: BadgeType = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() icon?: string;
}
