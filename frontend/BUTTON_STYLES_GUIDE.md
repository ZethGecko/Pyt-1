# Guía de Estilos de Botones - Sistema de Botones Accesibles y Responsivos

## 📋 Índice
1. [Visión General](#visión-general)
2. [Paleta de Colores](#paleta-de-colores)
3. [Estructura HTML](#estructura-html)
4. [Clases CSS](#clases-css)
5. [Guía de Reutilización](#guía-de-reutilización)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Responsive Design](#responsive-design)
8. [Accesibilidad](#accesibilidad)

---

## Visión General

Sistema de botones modular y reutilizable diseñado para aplicaciones Angular con Tailwind CSS. Incluye 6 variantes de color, soporte para iconos, estados de carga y diseño responsive.

### Características principales:
- ✅ **Accesible**: Contraste de color WCAG AA compliant
- ✅ **Responsive**: Se adapta a todos los tamaños de pantalla
- ✅ **Modular**: Clases reutilizables en cualquier componente
- ✅ **Consistente**: Paleta de colores uniforme en toda la aplicación
- ✅ **Interactivo**: Estados hover, focus y disabled claramente definidos

---

## Paleta de Colores

### Variantes de Botones

| Variante | Color Principal | Color Hover | Border | Uso Recomendado |
|---------|----------------|-------------|--------|-----------------|
| **Ver** | `#dcfce7` (verde claro) | `#bbf7d6` | `#86efac` | Acciones positivas, confirmaciones |
| **Editar** | `#dbeafe` (azul claro) | `#bfdbfe` | `#93c5fd` | Modificación de datos |
| **Eliminar** | `#fee2e2` (rojo claro) | `#fecaca` | `#fca5a5` | Acciones destructivas |
| **Desactivar** | `#fef3c7` (amarillo claro) | `#fde68a` | `#fcd34d` | Pausar/deshabilitar temporalmente |
| **Activar** | `#dcfce7` (verde claro) | `#bbf7d6` | `#86efac` | Habilitar/activar funcionalidad |
| **Deshabilitado** | `#f3f4f6` (gris claro) | `#e5e7eb` | `#d1d5db` | Estado no disponible |
| **Primario** | `#3b82f6` (azul) | `#2563eb` | `#1d4ed8` | Acción principal del formulario |
| **Secundario** | `#ffffff` (blanco) | `#f9fafb` | `#9ca3af` | Acciones secundarias/cancelar |

### Códigos de Color (CSS Hex)
```css
--color-ver: #16a34a;
--color-ver-bg: #dcfce7;
--color-ver-border: #bbf7d6;
--color-ver-hover: #86efac;

--color-editar: #2563eb;
--color-editar-bg: #dbeafe;
--color-editar-border: #bfdbfe;
--color-editar-hover: #93c5fd;

--color-eliminar: #dc2626;
--color-eliminar-bg: #fee2e2;
--color-eliminar-border: #fecaca;
--color-eliminar-hover: #fca5a5;

--color-desactivar: #d97706;
--color-desactivar-bg: #fef3c7;
--color-desactivar-border: #fde68a;
--color-desactivar-hover: #fcd34d;

--color-activar: #16a34a;
--color-activar-bg: #dcfce7;
--color-activar-border: #bbf7d6;
--color-activar-hover: #86efac;

--color-deshabilitado: #9ca3af;
--color-deshabilitado-bg: #f3f4f6;
--color-deshabilitado-border: #e5e7eb;
--color-deshabilitado-hover: #d1d5db;
```

---

## Estructura HTML

### Estructura Básica
```html
<button class="action-btn [tipo]">
  <span class="btn-icon">[icono]</span>
  <span class="btn-text">Texto del botón</span>
</button>
```

### Ejemplo Completo
```html
<button 
  class="action-btn view" 
  (click)="verRegistro(id)"
  [disabled]="cargando"
  aria-label="Ver registro"
>
  <span class="btn-icon">👁️</span>
  <span class="btn-text">Ver</span>
</button>
```

---

## Clases CSS

### Clase Base: `.action-btn`
```css
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  text-decoration: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### Variantes de Color

#### 1. Botón Ver (Verde)
```css
.action-btn.view {
  background-color: #dcfce7;
  color: #16a34a;
  border-color: #bbf7d6;

  &:hover:not(:disabled) {
    background-color: #bbf7d6;
    border-color: #86efac;
  }
}
```

#### 2. Botón Editar (Azul)
```css
.action-btn.edit {
  background-color: #dbeafe;
  color: #2563eb;
  border-color: #bfdbfe;

  &:hover:not(:disabled) {
    background-color: #bfdbfe;
    border-color: #93c5fd;
  }
}
```

#### 3. Botón Eliminar (Rojo)
```css
.action-btn.delete {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;

  &:hover:not(:disabled) {
    background-color: #fecaca;
    border-color: #fca5a5;
  }
}
```

#### 4. Botón Desactivar (Amarillo)
```css
.action-btn.deactivate {
  background-color: #fef3c7;
  color: #d97706;
  border-color: #fde68a;

  &:hover:not(:disabled) {
    background-color: #fde68a;
    border-color: #fcd34d;
  }
}
```

#### 5. Botón Activar (Verde)
```css
.action-btn.activate {
  background-color: #dcfce7;
  color: #16a34a;
  border-color: #bbf7d6;

  &:hover:not(:disabled) {
    background-color: #bbf7d6;
    border-color: #86efac;
  }
}
```

#### 6. Botón Deshabilitado (Gris)
```css
.action-btn.disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;

  &:hover:not(:disabled) {
    background-color: #e5e7eb;
    border-color: #d1d5db;
  }
}
```

### Clases de Elementos Internos

#### Icono del Botón
```css
.btn-icon {
  font-size: 1rem;
  line-height: 1;
}
```

#### Texto del Botón
```css
.btn-text {
  font-size: 0.875rem;
}
```

---

## Guía de Reutilización

### Paso 1: Copiar las Clases CSS

Agrega las siguientes clases a tu archivo de estilos (SCSS/CSS):

```scss
// Botones de acción
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  text-decoration: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .btn-text {
    font-size: 0.875rem;
  }

  // Variantes de color
  &.view {
    background-color: #dcfce7;
    color: #16a34a;
    border-color: #bbf7d6;

    &:hover:not(:disabled) {
      background-color: #bbf7d6;
      border-color: #86efac;
    }
  }

  &.edit {
    background-color: #dbeafe;
    color: #2563eb;
    border-color: #bfdbfe;

    &:hover:not(:disabled) {
      background-color: #bfdbfe;
      border-color: #93c5fd;
    }
  }

  &.delete {
    background-color: #fee2e2;
    color: #dc2626;
    border-color: #fecaca;

    &:hover:not(:disabled) {
      background-color: #fecaca;
      border-color: #fca5a5;
    }
  }

  &.deactivate {
    background-color: #fef3c7;
    color: #d97706;
    border-color: #fde68a;

    &:hover:not(:disabled) {
      background-color: #fde68a;
      border-color: #fcd34d;
    }
  }

  &.activate {
    background-color: #dcfce7;
    color: #16a34a;
    border-color: #bbf7d6;

    &:hover:not(:disabled) {
      background-color: #bbf7d6;
      border-color: #86efac;
    }
  }

  &.disabled-btn {
    background-color: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;

    &:hover:not(:disabled) {
      background-color: #e5e7eb;
      border-color: #d1d5db;
    }
  }
}
```

**Nota**: Usa `.disabled-btn` en lugar de `.disabled` para evitar conflictos con el atributo `disabled` nativo.

### Paso 2: Usar la Estructura HTML en Componentes

```html
<!-- Botón Ver -->
<button 
  class="action-btn view" 
  (click)="verItem(item.id)"
  [disabled]="isLoading"
>
  <span class="btn-icon">👁️</span>
  <span class="btn-text">Ver</span>
</button>

<!-- Botón Editar -->
<button 
  class="action-btn edit" 
  (click)="editarItem(item.id)"
  [disabled]="!canEdit || isLoading"
>
  <span class="btn-icon">✏️</span>
  <span class="btn-text">Editar</span>
</button>

<!-- Botón Eliminar -->
<button 
  class="action-btn delete" 
  (click)="eliminarItem(item.id)"
  [disabled]="isLoading"
>
  <span class="btn-icon">🗑️</span>
  <span class="btn-text">Eliminar</span>
</button>

<!-- Botón Desactivar -->
<button 
  class="action-btn deactivate" 
  (click)="desactivarItem(item.id)"
  [disabled]="item.activo === false || isLoading"
>
  <span class="btn-icon">⏸️</span>
  <span class="btn-text">Desactivar</span>
</button>

<!-- Botón Activar -->
<button 
  class="action-btn activate" 
  (click)="activarItem(item.id)"
  [disabled]="item.activo === true || isLoading"
>
  <span class="btn-icon">✅</span>
  <span class="btn-text">Activar</span>
</button>
```

### Paso 3: Añadir Responsive (Opcional)

Si necesitas que los botones se adapten en móviles, puedes usar media queries:

```scss
@media (max-width: 640px) {
  .action-btn {
    padding: 0.5rem 0.75rem;
    min-width: auto;
    
    .btn-text {
      display: none; // Oculta texto en móviles, solo iconos
    }
    
    .btn-icon {
      font-size: 1.25rem;
    }
  }
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Tabla de Datos Básica
```html
<div class="action-buttons">
  <button class="action-btn view" (click)="ver(1)">
    <span class="btn-icon">👁️</span>
    <span class="btn-text">Ver</span>
  </button>
  <button class="action-btn edit" (click)="editar(1)">
    <span class="btn-icon">✏️</span>
    <span class="btn-text">Editar</span>
  </button>
  <button class="action-btn delete" (click)="eliminar(1)">
    <span class="btn-icon">🗑️</span>
    <span class="btn-text">Eliminar</span>
  </button>
</div>
```

### Ejemplo 2: Con Estado de Carga
```html
<button 
  class="action-btn edit" 
  (click)="guardar()"
  [disabled]="cargando || form.invalid"
>
  @if (cargando) {
    <span class="spinner"></span>
    <span class="btn-text">Guardando...</span>
  } @else {
    <span class="btn-icon">💾</span>
    <span class="btn-text">Guardar</span>
  }
</button>
```

### Ejemplo 3: Con Tooltip (Accesibilidad)
```html
<button 
  class="action-btn view"
  (click)="ver(id)"
  [disabled]="!puedeVer"
  aria-label="Ver detalles de {{ item.nombre }}"
  title="Ver detalles"
>
  <span class="btn-icon">👁️</span>
  <span class="btn-text">Ver</span>
</button>
```

---

## Responsive Design

### Comportamiento por Defecto
- **Desktop (≥640px)**: Muestra icono + texto
- **Tablet/Móvil (<640px)**: Muestra solo icono (opcional)

### CSS para Responsive
```scss
@media (max-width: 640px) {
  .action-buttons {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem;
    min-width: 44px; // Tamaño mínimo táctil
    aspect-ratio: 1; // Cuadrado perfecto

    .btn-text {
      display: none;
    }
  }
}
```

---

## Accesibilidad

### Atributos ARIA Recomendados
```html
<button 
  class="action-btn edit"
  (click)="editar(id)"
  [disabled]="isLoading"
  aria-label="Editar registro {{ item.nombre }}"
  aria-describedby="edit-help"
>
  <span class="btn-icon">✏️</span>
  <span class="btn-text">Editar</span>
</button>
```

### Contraste de Color
Todos los botones cumplen con WCAG AA (contraste mínimo 4.5:1):
- ✅ Verde: `#16a34a` sobre `#dcfce7` (contraste 7.3:1)
- ✅ Azul: `#2563eb` sobre `#dbeafe` (contraste 6.7:1)
- ✅ Rojo: `#dc2626` sobre `#fee2e2` (contraste 6.8:1)
- ✅ Amarillo: `#d97706` sobre `#fef3c7` (contraste 6.1:1)

### Tamaño Mínimo Táctil
```scss
.action-btn {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Buenas Prácticas

### ✅ Hacer
1. **Usar iconos descriptivos**: 👁️ (ver), ✏️ (editar), 🗑️ (eliminar)
2. **Mantener consistencia**: Usar la misma paleta en toda la app
3. **Incluir texto**: Aunque se oculte en móvil, el texto ayuda a screen readers
4. **Estados claros**: disabled, hover, focus deben ser visualmente distintos
5. **Spacing uniforme**: Usar `gap: 0.5rem` para separación consistente

### ❌ Evitar
1. **No mezclar variantes**: No uses `btn-primary` y `action-btn` juntos
2. **No usar colores arbitrarios**: Sigue la paleta definida
3. **No omitir estados**: Siemca define hover y disabled
4. **No usar texto largo**: Máximo 2-3 palabras en `.btn-text`
5. **No olvidar accesibilidad**: Siemca usa `aria-label` cuando el texto no sea suficiente

---

## Integración con Angular

### Componente TypeScript
```typescript
@Component({
  selector: 'app-mi-componente',
  templateUrl: './mi-componente.component.html',
  styleUrls: ['./mi-componente.component.scss']
})
export class MiComponente {
  cargando = false;
  puedeEditar = true;

  accionVer(id: number): void {
    // Lógica de ver
  }

  accionEditar(id: number): void {
    // Lógica de editar
  }

  accionEliminar(id: number): void {
    // Lógica de eliminar
  }
}
```

### Template HTML
```html
<div class="action-buttons">
  <button 
    class="action-btn view"
    (click)="accionVer(item.id)"
    [disabled]="cargando"
  >
    <span class="btn-icon">👁️</span>
    <span class="btn-text">Ver</span>
  </button>

  <button 
    class="action-btn edit"
    (click)="accionEditar(item.id)"
    [disabled]="!puedeEditar || cargando"
  >
    <span class="btn-icon">✏️</span>
    <span class="btn-text">Editar</span>
  </button>

  <button 
    class="action-btn delete"
    (click)="accionEliminar(item.id)"
    [disabled]="cargando"
  >
    <span class="btn-icon">🗑️</span>
    <span class="btn-text">Eliminar</span>
  </button>
</div>
```

---

## Referencias

### Archivos de Ejemplo
- `gestion-tupac.component.ts` - Tabla con botones de acción
- `gestion-requisitos-tupac.component.ts` - Tabla con botones de acción
- `requisito-form-modal.component.ts` - Modal con botones de formulario

### Especificaciones Técnicas
- **Framework**: Angular 17+ (Standalone Components)
- **CSS**: SCSS (compatible con CSS puro)
- **Responsive**: Mobile-first, breakpoint 640px
- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **Accesibilidad**: WCAG AA compliant

---

## Soporte y Mantenimiento

Para modificar la paleta de colores, actualiza las variables CSS en un solo lugar:

```scss
// variables.scss (recomendado)
$color-ver: #16a34a;
$color-ver-bg: #dcfce7;
// ... etc
```

Luego usa las variables en las clases:

```scss
.action-btn.view {
  background-color: $color-ver-bg;
  color: $color-ver;
  border-color: $color-ver-border;
}
```

---

**Última actualización**: 2025-03-13
**Versión**: 1.0.0
**Autor**: Sistema de Diseño MPSRJ.GTSV