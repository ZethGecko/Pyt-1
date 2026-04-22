import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: number | string;
  disabled?: boolean;
  hidden?: boolean;
}

export interface TabAction {
  id: string;
  label: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-detail-tabs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="detail-tabs-container">
      
      <!-- Header con título y acciones -->
      <div class="detail-header">
        <div class="header-content">
          @if (title) {
            <h2 class="detail-title">{{ title }}</h2>
          }
          @if (subtitle) {
            <p class="detail-subtitle">{{ subtitle }}</p>
          }
        </div>
        
        <div class="header-actions">
          @for (action of actions; track action.id) {
            <button 
              class="btn"
              [class]="'btn-' + (action.class || 'primary')"
              [disabled]="action.disabled"
              (click)="onActionClick(action.id)">
              @if (action.icon) {
                <span class="action-icon">{{ action.icon }}</span>
              }
              {{ action.label }}
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrapper">
        <div class="tabs-nav">
          @for (tab of tabs; track tab.id) {
            @if (!tab.hidden) {
              <button 
                class="tab-button"
                [class.active]="activeTab === tab.id"
                [class.disabled]="tab.disabled"
                [disabled]="tab.disabled"
                (click)="setActiveTab(tab.id)">
                
                @if (tab.icon) {
                  <span class="tab-icon">{{ tab.icon }}</span>
                }
                {{ tab.label }}
                
                @if (tab.badge !== undefined) {
                  <span class="tab-badge" [class.has-badge]="true">
                    {{ tab.badge }}
                  </span>
                }
              </button>
            }
          }
        </div>
        
        <!-- Indicador de posición -->
        <div class="tabs-indicator" [style.transform]="'translateX(' + indicatorPosition + 'px)'"></div>
      </div>

      <!-- Contenido del tab activo -->
      <div class="tab-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .detail-tabs-container {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-content {
      flex: 1;
    }

    .detail-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .detail-subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #6b7280;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2563eb;
    }

    .btn-secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background-color: #f9fafb;
    }

    .btn-success {
      background-color: #22c55e;
      color: white;
    }

    .btn-success:hover {
      background-color: #16a34a;
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background-color: #dc2626;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tabs-wrapper {
      position: relative;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .tabs-nav {
      display: flex;
      gap: 4px;
      padding: 0 16px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs-nav::-webkit-scrollbar {
      display: none;
    }

    .tab-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      background: transparent;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      position: relative;
    }

    .tab-button:hover {
      color: #374151;
    }

    .tab-button.active {
      color: #3b82f6;
    }

    .tab-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-icon {
      font-size: 16px;
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      font-size: 11px;
      font-weight: 600;
      background-color: #e5e7eb;
      color: #374151;
      border-radius: 10px;
    }

    .tab-badge.has-badge {
      background-color: #3b82f6;
      color: white;
    }

    .tab-button.active .tab-badge.has-badge {
      background-color: #3b82f6;
      color: white;
    }

    .tabs-indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 80px;
      height: 2px;
      background-color: #3b82f6;
      transition: transform 0.3s ease;
    }

    .tab-content {
      padding: 24px;
      min-height: 200px;
    }
  `]
})
export class DetailTabsComponent implements OnInit, AfterViewInit {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() tabs: TabConfig[] = [];
  @Input() actions: TabAction[] = [];
  @Input() activeTabId?: string;

  @Output() tabChange = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<string>();

  activeTab: string = '';
  indicatorPosition: number = 0;
  private tabWidths: number[] = [];
  private tabOffsets: number[] = [];

  ngOnInit(): void {
    if (this.tabs.length > 0) {
      this.activeTab = this.activeTabId || this.tabs[0].id;
    }
  }

  ngAfterViewInit(): void {
    this.calculateTabPositions();
  }

  setActiveTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTab = tabId;
      this.tabChange.emit(tabId);
      this.updateIndicator();
    }
  }

  onActionClick(actionId: string): void {
    this.actionClick.emit(actionId);
  }

  private calculateTabPositions(): void {
    setTimeout(() => {
      const buttons = document.querySelectorAll('.tab-button');
      this.tabOffsets = Array.from(buttons).map((btn: any) => {
        return btn.offsetLeft;
      });
      this.tabWidths = Array.from(buttons).map((btn: any) => {
        return btn.offsetWidth;
      });
      this.updateIndicator();
    }, 100);
  }

  private updateIndicator(): void {
    const tabIndex = this.tabs.findIndex(t => t.id === this.activeTab);
    if (tabIndex >= 0 && this.tabOffsets[tabIndex] !== undefined) {
      this.indicatorPosition = this.tabOffsets[tabIndex];
    }
  }
}
