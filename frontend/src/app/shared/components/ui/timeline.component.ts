import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  id: number;
  title: string;
  description?: string;
  date: Date | string;
  icon?: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  details?: Record<string, any>;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline">
      @for (item of items; track item.id; let last = $last) {
        <div class="timeline-item" [class]="'timeline-item--' + item.status">
          
          <!-- Línea conectora -->
          @if (!last) {
            <div class="timeline-connector"></div>
          }
          
          <!-- Punto/Icono -->
          <div class="timeline-marker">
            @if (item.status === 'completed') {
              <span class="marker-icon completed">✓</span>
            } @else if (item.status === 'current') {
              <span class="marker-icon current">
                @if (item.icon) {
                  {{ item.icon }}
                } @else {
                  ●
                }
              </span>
            } @else if (item.status === 'error') {
              <span class="marker-icon error">✕</span>
            } @else {
              <span class="marker-icon pending">○</span>
            }
          </div>
          
          <!-- Contenido -->
          <div class="timeline-content">
            <div class="timeline-header">
              <h4 class="timeline-title">{{ item.title }}</h4>
              <span class="timeline-date">
                {{ formatDate(item.date) }}
              </span>
            </div>
            
            @if (item.description) {
              <p class="timeline-description">{{ item.description }}</p>
            }
            
            @if (item.details) {
              <div class="timeline-details">
                @for (detail of getDetailsArray(item.details); track detail.key) {
                  <div class="detail-item">
                    <span class="detail-label">{{ detail.key }}:</span>
                    <span class="detail-value">{{ detail.value }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline {
      position: relative;
      padding-left: 30px;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 24px;
    }

    .timeline-item:last-child {
      padding-bottom: 0;
    }

    .timeline-connector {
      position: absolute;
      left: 15px;
      top: 30px;
      bottom: 0;
      width: 2px;
      background-color: #e5e7eb;
    }

    .timeline-item--completed .timeline-connector {
      background-color: #22c55e;
    }

    .timeline-item--current .timeline-connector {
      background: linear-gradient(to bottom, #22c55e 50%, #e5e7eb 50%);
    }

    .timeline-marker {
      position: absolute;
      left: -30px;
      top: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .marker-icon {
      font-size: 16px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .marker-icon.completed {
      background-color: #22c55e;
      color: white;
      font-size: 14px;
    }

    .marker-icon.current {
      background-color: #3b82f6;
      color: white;
      font-size: 18px;
      animation: pulse 2s infinite;
    }

    .marker-icon.error {
      background-color: #ef4444;
      color: white;
      font-size: 14px;
    }

    .marker-icon.pending {
      background-color: #f3f4f6;
      color: #9ca3af;
      border: 2px solid #d1d5db;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
      }
    }

    .timeline-content {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-left: 8px;
    }

    .timeline-item--current .timeline-content {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .timeline-item--completed .timeline-content {
      border-left: 3px solid #22c55e;
    }

    .timeline-item--error .timeline-content {
      border-left: 3px solid #ef4444;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 4px;
    }

    .timeline-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    .timeline-date {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
    }

    .timeline-description {
      margin: 0;
      font-size: 13px;
      color: #4b5563;
      line-height: 1.4;
    }

    .timeline-details {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f3f4f6;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }

    .detail-item {
      font-size: 12px;
    }

    .detail-label {
      color: #6b7280;
      margin-right: 4px;
    }

    .detail-value {
      color: #374151;
      font-weight: 500;
    }
  `]
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDetailsArray(details: Record<string, any>): { key: string; value: any }[] {
    return Object.entries(details).map(([key, value]) => ({ key, value }));
  }
}
