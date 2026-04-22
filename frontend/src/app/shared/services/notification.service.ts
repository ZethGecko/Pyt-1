import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  dismissible?: boolean;
  duration?: number; // en milisegundos, por defecto 3000
  removing?: boolean; // para animación de salida
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  notification$ = this.notificationSubject.asObservable();
  private timers: Map<number, any> = new Map();

  constructor(private ngZone: NgZone) {}

  // Métodos principales (show*)
  showSuccess(message: string, title?: string, duration: number = 3000): void {
    const id = Date.now();
    const notification: Notification = {
      id,
      type: 'success',
      message,
      title,
      dismissible: true,
      duration
    };
    this.addNotification(notification);
  }

  showError(message: string, title?: string, duration: number = 5000): void {
    const id = Date.now();
    const notification: Notification = {
      id,
      type: 'error',
      message,
      title,
      dismissible: true,
      duration
    };
    this.addNotification(notification);
  }

  showWarning(message: string, title?: string, duration: number = 4000): void {
    const id = Date.now();
    const notification: Notification = {
      id,
      type: 'warning',
      message,
      title,
      dismissible: true,
      duration
    };
    this.addNotification(notification);
  }

  showInfo(message: string, title?: string, duration: number = 3000): void {
    const id = Date.now();
    const notification: Notification = {
      id,
      type: 'info',
      message,
      title,
      dismissible: true,
      duration
    };
    this.addNotification(notification);
  }

  // Método privado para añadir notificación y configurar timer
  private addNotification(notification: Notification): void {
    // Ejecutar dentro de NgZone para evitar ExpressionChangedAfterItHasBeenCheckedError
    this.ngZone.run(() => {
      this.notificationSubject.next([notification, ...this.notificationSubject.getValue()]);
    });

    // Configurar timer de auto-despacho si tiene duration
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
      this.timers.set(notification.id, timer);
    }
  }

  // Métodos de compatibilidad (alias)
  success(message: string, title?: string, duration?: number): void {
    this.showSuccess(message, title, duration);
  }

  error(message: string, title?: string, duration?: number): void {
    this.showError(message, title, duration);
  }

  warning(message: string, title?: string, duration?: number): void {
    this.showWarning(message, title, duration);
  }

  info(message: string, title?: string, duration?: number): void {
    this.showInfo(message, title, duration);
  }

  // Obtener todas las notificaciones
  getNotifications(): Notification[] {
    return this.notificationSubject.getValue();
  }

  // Descartar notificación con animación
  dismiss(id: number): void {
    // Si ya está siendo removida, no hacer nada
    const current = this.notificationSubject.getValue();
    const notification = current.find((n: Notification) => n.id === id);
    
    if (notification && notification.removing) {
      return; // Ya está en proceso de eliminación
    }

    // Limpiar timer si existe
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    if (notification) {
      // Marcar como removiendo para animación
      const updated = current.map((n: Notification) =>
        n.id === id ? { ...n, removing: true } : n
      );
      
      // Ejecutar dentro de NgZone
      this.ngZone.run(() => {
        this.notificationSubject.next(updated);
      });

      // Remover después de la animación
      setTimeout(() => {
        const afterAnimation = this.notificationSubject.getValue().filter((n: Notification) => n.id !== id);
        this.ngZone.run(() => {
          this.notificationSubject.next(afterAnimation);
        });
      }, 300); // Duración de la animación CSS
    }
  }

  // Limpiar todas las notificaciones
  clearAll(): void {
    // Limpiar todos los timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    this.ngZone.run(() => {
      this.notificationSubject.next([]);
    });
  }
}
