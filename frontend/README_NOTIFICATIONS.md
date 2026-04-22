# Guía del Sistema de Notificaciones

## 📋 Descripción General

El sistema de notificaciones implementado permite mostrar mensajes de feedback al usuario (éxito, error, advertencia, info) que desaparecen automáticamente después de un tiempo configurable.

## 🎯 Características

- **Auto-despacho**: Las notificaciones se eliminan automáticamente después de 3-5 segundos
- **Tipos**: Success (verde), Error (rojo), Warning (amarillo), Info (azul)
- **Animaciones**: Transiciones suaves de entrada y salida
- **Responsive**: Se adapta a móviles y escritorio
- **Tamaño compacto**: 20rem de ancho máximo
- **Thread-safe**: Cada notificación maneja su propio timer

## 📦 Archivos del Sistema

```
frontend/src/app/shared/
├── services/
│   └── notification.service.ts    # Servicio principal
└── components/
    └── notification-container.component.ts  # Componente contenedor
```

## 🚀 Cómo Usar

### 1. Inyectar el servicio

```typescript
import { NotificationService } from '../shared/services/notification.service';

@Component({
  // ...
})
export class MiComponente {
  constructor(
    private notificationService: NotificationService
  ) {}

  // ...
}
```

### 2. Mostrar notificaciones

El servicio proporciona métodos para cada tipo de notificación:

```typescript
// Success (3 segundos por defecto)
this.notificationService.success(
  'Operación completada exitosamente',
  'Éxito',
  3000
);

// Error (5 segundos por defecto)
this.notificationService.error(
  'Ha ocurrido un error',
  'Error',
  5000
);

// Warning (4 segundos por defecto)
this.notificationService.warning(
  'Atención: revise los datos',
  'Advertencia',
  4000
);

// Info (3 segundos por defecto)
this.notificationService.info(
  'Información importante',
  'Info',
  3000
);
```

**Parámetros:**
- `message` (string, requerido): Mensaje de la notificación
- `title` (string, opcional): Título de la notificación
- `duration` (number, opcional): Duración en milisegundos antes de auto-eliminarse

### 3. Usar alias (más corto)

También puedes usar los alias que aceptan `duration` opcional:

```typescript
this.notificationService.success('Mensaje', 'Título'); // Usa duración por defecto
this.notificationService.error('Mensaje de error'); // 5000ms por defecto
```

### 4. Dismiss manual

```typescript
// Desde el componente, puedes dismiss manualmente
this.notificationService.dismiss(notificationId);

// O limpiar todas
this.notificationService.clearAll();
```

## 🏗️ Configuración

### Agregar el contenedor al layout

El contenedor de notificaciones debe estar en un componente padre accesible desde toda la aplicación (generalmente en `app.component.html`):

```html
<!-- app.component.html -->
<div class="app-layout">
  <!-- ... sidebar, navbar, etc. -->
  
  <main class="main-content">
    <router-outlet></router-outlet>
  </main>
  
  <!-- Contenedor de notificaciones (SIEMPRE al final) -->
  <app-notification-container></app-notification-container>
</div>
```

### Estilos personalizados

Los estilos están definidos en `notification-container.component.ts`. Puedes modificar:

- **Ancho máximo**: `.notification-container { max-width: 20rem; }`
- **Posición**: `top: 1rem; right: 1rem;`
- **Duración de animación**: `animation: slideIn 0.3s ease-out;`
- **Colores**: Modifica las clases `&--success`, `&--error`, etc.

## 🔧 Implementación Técnica

### Cómo funciona

1. **Creación**: Cuando llamas a `success()`, `error()`, etc., el servicio:
   - Genera un ID único con `Date.now()`
   - Crea el objeto notificación con `duration`
   - Lo añade al inicio del array de notificaciones
   - **Configura un `setTimeout`** que llamará a `dismiss()` después de `duration`

2. **Auto-despacho**: Cuando el timer se dispara:
   - Se marca la notificación con `removing: true` (para animación)
   - Se espera 300ms (duración de la animación CSS)
   - Se elimina la notificación del array

3. **Dismiss manual**: Cuando el usuario hace clic en la X:
   - Se cancela el timer (si existe)
   - Se marca `removing: true`
   - Se elimina después de la animación

### Gestión de timers

El servicio mantiene un `Map<number, any>` llamado `timers` que asocia `notificationId` con `timerId`. Esto permite:
- Cancelar timers al dismiss manual
- Evitar múltiples timers para la misma notificación
- Limpiar todos los timers al destruir el servicio

## 📝 Ejemplos de Uso

### Ejemplo 1: CRUD básico

```typescript
// Crear
this.service.crear(data).subscribe({
  next: () => {
    this.notificationService.success(
      'Registro creado exitosamente',
      'Éxito',
      3000
    );
    this.cargarDatos();
  },
  error: (err) => {
    this.notificationService.error(
      err.error?.message || 'Error al crear',
      'Error',
      5000
    );
  }
});

// Actualizar
this.service.actualizar(id, data).subscribe({
  next: () => {
    this.notificationService.success('Registro actualizado', 'Éxito');
  }
});

// Eliminar
this.service.eliminar(id).subscribe({
  next: () => {
    this.notificationService.success('Registro eliminado', 'Éxito');
  }
});
```

### Ejemplo 2: Validación de formulario

```typescript
guardar() {
  if (!this.form.nombre) {
    this.notificationService.warning(
      'El nombre es requerido',
      'Validación',
      3000
    );
    return;
  }
  
  // ... guardar
}
```

### Ejemplo 3: Operación asincrónica

```typescript
async cargarDatos() {
  try {
    this.cargando = true;
    await this.service.obtenerDatos();
    this.notificationService.success('Datos cargados', 'Éxito');
  } catch (error) {
    this.notificationService.error('Error al cargar datos', 'Error');
  } finally {
    this.cargando = false;
  }
}
```

## ⚙️ Personalización de Duraciones

Puedes ajustar las duraciones por tipo:

```typescript
// Error: 10 segundos (más tiempo para leer errores)
this.notificationService.error('Mensaje de error', 'Error', 10000);

// Success: 2 segundos (breve)
this.notificationService.success('OK', 'Éxito', 2000);

// Warning: 7 segundos (advertencias importantes)
this.notificationService.warning('Atención', 'Advertencia', 7000);
```

## 🎨 Colores por Tipo

Los colores están definidos en el componente contenedor:

- **Success**: Verde `#10b981` (borde izquierdo)
- **Error**: Rojo `#ef4444` (borde izquierdo)
- **Warning**: Amarillo/Naranja `#f59e0b` (borde izquierdo)
- **Info**: Azul `#3b82f6` (borde izquierdo)

Para cambiar los colores, edita las clases en `notification-container.component.ts`:

```scss
&--success {
  border-left: 3px solid #10b981; // Cambiar color
}
```

## 🐛 Troubleshooting

### Las notificaciones no desaparecen automáticamente

**Posibles causas:**
1. No se está pasando el parámetro `duration` correctamente
2. El contenedor `<app-notification-container>` no está en el template
3. Hay un error en la consola que impide la ejecución

**Solución:**
- Verifica que estás llamando a `success()`, `error()`, etc. con 3 argumentos
- Asegúrate de que el contenedor esté en `app.component.html`
- Revisa la consola del navegador para errores

### Las notificaciones se superponen

**Causa:** Múltiples notificaciones en poco tiempo.

**Solución:** El sistema ya apila notificaciones verticalmente con `gap: 0.5rem`. Si necesitas limitar el número máximo, modifica el servicio para que elimine notificaciones antiguas.

### El timer no se resetea

**Nota:** Cada notificación tiene su propio timer independiente. Si se crea una nueva notificación, NO afecta los timers de las notificaciones existentes. Esto es por diseño.

## 📚 Referencia API

### NotificationService

```typescript
class NotificationService {
  // Mostrar notificaciones
  success(message: string, title?: string, duration?: number): void
  error(message: string, title?: string, duration?: number): void
  warning(message: string, title?: string, duration?: number): void
  info(message: string, title?: string, duration?: number): void
  
  // Aliases (iguales)
  showSuccess(message: string, title?: string, duration?: number): void
  showError(message: string, title?: string, duration?: number): void
  showWarning(message: string, title?: string, duration?: number): void
  showInfo(message: string, title?: string, duration?: number): void
  
  // Obtener notificaciones actuales
  getNotifications(): Notification[]
  
  // Dismiss manual
  dismiss(id: number): void
  
  // Limpiar todas
  clearAll(): void
  
  // Observable para suscripción
  notification$: Observable<Notification[]>
}
```

### Notification Interface

```typescript
interface Notification {
  id: number;              // ID único (autogenerado)
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;         // Mensaje principal
  title?: string;          // Título (opcional)
  dismissible?: boolean;   // Si se puede cerrar manualmente (default: true)
  duration?: number;       // Duración en ms antes de auto-eliminarse
  removing?: boolean;      // Marca para animación de salida (sistema)
}
```

## 🔄 Migración desde alertas nativas

### Antes (alert nativo)

```typescript
alert('Operación completada');
```

### Después (NotificationService)

```typescript
this.notificationService.success('Operación completada', 'Éxito');
```

### Antes (confirm nativo)

```typescript
if (confirm('¿Está seguro?')) {
  this.eliminar();
}
```

### Después (confirm + notificación)

```typescript
if (confirm('¿Está seguro?')) {
  this.eliminar();
  this.notificationService.success('Eliminado', 'Éxito');
}
```

## 📊 Buenas Prácticas

1. **Siempre especificar título y duración** para consistencia
2. **Usar tipos apropiados**:
   - `success`: Operaciones CRUD exitosas
   - `error`: Errores del servidor, validaciones fallidas
   - `warning`: Advertencias, datos faltantes
   - `info`: Información general, notificaciones neutras
3. **Mensajes concisos**: Máximo 2-3 líneas de texto
4. **Duración según urgencia**:
   - Errores: 5000ms (más tiempo para leer)
   - Success: 3000ms
   - Warning: 4000ms
5. **No abusar**: No mostrar múltiples notificaciones simultáneas innecesariamente

## 🧪 Testing

Para probar el sistema:

```typescript
// En cualquier componente
this.notificationService.success('Test success', 'Test', 2000);
this.notificationService.error('Test error', 'Test', 2000);
this.notificationService.warning('Test warning', 'Test', 2000);
this.notificationService.info('Test info', 'Test', 2000);
```

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.html          # <app-notification-container> aquí
│   │   └── shared/
│   │       ├── services/
│   │       │   └── notification.service.ts
│   │       └── components/
│   │           └── notification-container.component.ts
└── README_NOTIFICATIONS.md             # Esta guía
```

## 🔗 Recursos Adicionales

- [Angular Dependency Injection](https://angular.io/guide/dependency-injection)
- [RxJS BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

---

**Última actualización**: 2025-03-14
**Versión**: 1.0.0
**Autor**: Kilo Code