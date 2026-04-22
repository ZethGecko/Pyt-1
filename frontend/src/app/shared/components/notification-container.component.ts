import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notifications; track notification.id) {
        <div class="notification notification--{{ notification.type }}"
             [class.notification--dismissible]="notification.dismissible"
             [class.notification--removing]="notification.removing">
          
          <div class="notification__icon">
            @switch (notification.type) {
              @case ('success') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              }
              @case ('error') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              }
              @case ('info') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            }
          </div>
          
          <div class="notification__content">
            @if (notification.title) {
              <h4 class="notification__title">{{ notification.title }}</h4>
            }
            <p class="notification__message">{{ notification.message }}</p>
          </div>
          
          @if (notification.dismissible) {
            <button type="button"
                    (click)="dismiss(notification)"
                    class="notification__close">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      max-width: 14rem;
      width: calc(100% - 2rem);
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      pointer-events: none;
    }
    
    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      background-color: white;
      box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 2px -2px rgb(0 0 0 / 0.1);
      pointer-events: auto;
      position: relative;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease;
      
      &--success {
        border-left: 3px solid #10b981;
        
        .notification__icon {
          color: #10b981;
        }
      }
      
      &--error {
        border-left: 3px solid #ef4444;
        
        .notification__icon {
          color: #ef4444;
        }
      }
      
      &--warning {
        border-left: 3px solid #f59e0b;
        
        .notification__icon {
          color: #f59e0b;
        }
      }
      
      &--info {
        border-left: 3px solid #3b82f6;
        
        .notification__icon {
          color: #3b82f6;
        }
      }
      
      &--dismissible {
        padding-right: 1.5rem;
      }
    }
    
    .notification__icon {
      flex-shrink: 0;
      margin-top: 0.125rem;
      
      svg {
        width: 14px;
        height: 14px;
      }
    }
    
    .notification__content {
      flex: 1;
      min-width: 0;
    }
    
    .notification__title {
      font-size: 0.6875rem; /* 11px */
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.125rem;
    }
    
    .notification__message {
      font-size: 0.6875rem; /* 11px */
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }
    
    .notification__close {
      position: absolute;
      top: 0.375rem;
      right: 0.375rem;
      background: none;
      border: none;
      padding: 0.125rem;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.15s ease;
      
      svg {
        width: 12px;
        height: 12px;
      }
      
      &:hover {
        color: #64748b;
      }
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
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification--removing {
      animation: slideOut 0.3s ease-out forwards;
    }
    
    @media (max-width: 640px) {
      .notification-container {
        max-width: calc(100% - 1rem);
        right: 0.5rem;
        left: 0.5rem;
      }
      
      .notification {
        padding: 0.625rem;
        
        &--dismissible {
          padding-right: 1.75rem;
        }
      }
      
      .notification__title {
        font-size: 0.7rem;
      }
      
      .notification__message {
        font-size: 0.7rem;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notification$.subscribe(notifications => {
        // Ejecutar dentro de NgZone y marcar para detección de cambios
        this.ngZone.run(() => {
          this.notifications = notifications;
          this.cdr.markForCheck();
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dismiss(notification: Notification): void {
    if (notification.id) {
      this.notificationService.dismiss(notification.id);
    }
  }
}
