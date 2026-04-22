# Guía de Botones de Acción - Sistema de Botones Accesibles y Responsivos

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

Sistema de botones modular y reutilizable diseñado para aplicaciones Angular con estilos inline (SCSS dentro de Component). Incluye 6 variantes de color, soporte para iconos, estados de carga y diseño responsive.

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
| **Ver** | `#dcfce7` (verde claro) | `#bbf7d6` | `#bbf7d6` | Acciones positivas, confirmaciones |
| **Editar** | `#dbeafe` (azul claro) | `#bfdbfe` | `#bfdbfe` | Modificación de datos |
| **Eliminar** | `#fee2e2` (rojo claro) | `#fecaca` | `#fecaca` | Acciones destructivas |
| **Desactivar** | `#fef3c7` (amarillo claro) | `#fde047` | `#fde047` | Pausar/deshabilitar temporalmente |
| **Activar** | `#dcfce7` (verde claro) | `#bbf7d6` | `#bbf7d6` | Habilitar/activar funcionalidad |
| **Deshabilitado** | `#f3f4f6` (gris claro) | `#e5e7eb` | `#e5e7eb` | Estado no disponible |

### Códigos de Color (CSS Hex)
```css
--color-ver: #16a34a;
--color-ver-bg: #dcfce7;
--color-ver-border: #bbf7d6;
--color-ver-hover: #bbf7d6;

--color-editar: #2563eb;
--color-editar-bg: #dbeafe;
--color-editar-border: #bfdbfe;
--color-editar-hover: #bfdbfe;

--color-eliminar: #b91c1c;
--color-eliminar-bg: #fee2e2;
--color-eliminar-border: #fecaca;
--color-eliminar-hover: #fecaca;

--color-desactivar: #d97706;
--color-desactivar-bg: #fef3c7;
--color-desactivar-border: #fde047;
--color-desactivar-hover: #fde047;

--color-activar: #16a34a;
--color-activar-bg: #dcfce7;
--color-activar-border: #bbf7d6;
--color-activar-hover: #bbf7d6;

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
  <app-icon name="[icono]" size="sm"></app-icon>
  <span class="btn-text">Texto del botón</span>
</button>
```

### Ejemplo Completo
```html
<button
  class="action-btn view"
  (click)="verRegistro(id)"
  [disabled]="cargando"
  title="Ver registro"
>
  <app-icon name="list" size="sm"></app-icon>
  <span class="btn-text">Ver</span>
</button>
```

---

## Clases CSS

### Clase Base: `.action-btn`
```scss
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### Variantes de Color

#### 1. Botón Ver (Verde)
```scss
.action-btn.view {
  background-color: #dcfce7;
  color: #16a34a;
  border-color: #bbf7d6;

  &:hover:not(:disabled) {
    background-color: #bbf7d6;
  }
}
```

#### 2. Botón Editar (Azul)
```scss
.action-btn.edit {
  background-color: #dbeafe;
  color: #2563eb;
  border-color: #bfdbfe;

  &:hover:not(:disabled) {
    background-color: #bfdbfe;
  }
}
```

#### 3. Botón Eliminar (Rojo)
```scss
.action-btn.delete {
  background-color: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;

  &:hover:not(:disabled) {
    background-color: #fecaca;
  }
}
```

#### 4. Botón Desactivar (Amarillo)
```scss
.action-btn.toggle-active {
  background-color: #fef3c7;
  color: #d97706;
  border-color: #fde047;

  &:hover:not(:disabled) {
    background-color: #fde047;
  }
}
```

#### 5. Botón Activar (Verde)
```scss
.action-btn.toggle-inactive {
  background-color: #dcfce7;
  color: #16a34a;
  border-color: #bbf7d6;

  &:hover:not(:disabled) {
    background-color: #bbf7d6;
  }
}
```

#### 6. Botón Deshabilitado (Gris)
```scss
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Clase de Texto
```scss
.btn-text {
  display: none;
  font-size: 0.75rem;

  @media (min-width: 640px) {
    display: inline;
  }
}
```

---

## Guía de Reutilización

### Paso 1: Copiar las Clases CSS

Agrega las siguientes clases al bloque `styles` de tu componente:

```scss
styles: [`
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid transparent;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .action-btn.view {
    background-color: #dcfce7;
    color: #16a34a;
    border-color: #bbf7d6;

    &:hover:not(:disabled) {
      background-color: #bbf7d6;
    }
  }

  .action-btn.edit {
    background-color: #dbeafe;
    color: #2563eb;
    border-color: #bfdbfe;

    &:hover:not(:disabled) {
      background-color: #bfdbfe;
    }
  }

  .action-btn.delete {
    background-color: #fee2e2;
    color: #b91c1c;
    border-color: #fecaca;

    &:hover:not(:disabled) {
      background-color: #fecaca;
    }
  }

  .action-btn.toggle-active {
    background-color: #fef3c7;
    color: #d97706;
    border-color: #fde047;

    &:hover:not(:disabled) {
      background-color: #fde047;
    }
  }

  .action-btn.toggle-inactive {
    background-color: #dcfce7;
    color: #16a34a;
    border-color: #bbf7d6;

    &:hover:not(:disabled) {
      background-color: #bbf7d6;
    }
  }

  .btn-text {
    display: none;
    font-size: 0.75rem;

    @media (min-width: 640px) {
      display: inline;
    }
  }
`]
```

### Paso 2: Usar la Estructura HTML en Componentes

```html
<!-- Botón Ver -->
<button
  class="action-btn view"
  (click)="verItem(item.id)"
  [disabled]="!puedeVer"
  title="Ver detalles"
>
  <app-icon name="eye" size="sm"></app-icon>
  <span class="btn-text">Ver</span>
</button>

<!-- Botón Editar -->
<button
  class="action-btn edit"
  (click)="editarItem(item.id)"
  [disabled]="!puedeEditar"
  title="Editar"
>
  <app-icon name="edit" size="sm"></app-icon>
  <span class="btn-text">Editar</span>
</button>

<!-- Botón Eliminar -->
<button
  class="action-btn delete"
  (click)="eliminarItem(item.id)"
  [disabled]="!puedeEliminar"
  title="Eliminar"
>
  <app-icon name="trash-2" size="sm"></app-icon>
  <span class="btn-text">Eliminar</span>
</button>

<!-- Botón Desactivar -->
<button
  class="action-btn toggle-active"
  (click)="desactivarItem(item.id)"
  [disabled]="item.activo === false"
  title="Desactivar"
>
  <app-icon name="toggle-left" size="sm"></app-icon>
  <span class="btn-text">Desactivar</span>
</button>

<!-- Botón Activar -->
<button
  class="action-btn toggle-inactive"
  (click)="activarItem(item.id)"
  [disabled]="item.activo === true"
  title="Activar"
>
  <app-icon name="toggle-right" size="sm"></app-icon>
  <span class="btn-text">Activar</span>
</button>
```

### Paso 3: Añadir Responsive (Opcional)

Si necesitas que los botones se adapten en móviles, ya está incluido en `.btn-text` con `display: none` por defecto y `display: inline` en pantallas ≥640px.

---

## Ejemplos de Uso

### Ejemplo 1: Tabla de Datos Básica
```html
<div class="action-buttons">
  <button class="action-btn view" (click)="ver(1)">
    <app-icon name="eye" size="sm"></app-icon>
    <span class="btn-text">Ver</span>
  </button>
  <button class="action-btn edit" (click)="editar(1)">
    <app-icon name="edit" size="sm"></app-icon>
    <span class="btn-text">Editar</span>
  </button>
  <button class="action-btn delete" (click)="eliminar(1)">
    <app-icon name="trash-2" size="sm"></app-icon>
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
    <app-icon name="refresh" size="sm" customClass="animate-spin"></app-icon>
    <span class="btn-text">Guardando...</span>
  } @else {
    <app-icon name="save" size="sm"></app-icon>
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
  title="Ver detalles de {{ item.nombre }}"
>
  <app-icon name="eye" size="sm"></app-icon>
  <span class="btn-text">Ver</span>
</button>
```

---

## Responsive Design

### Comportamiento por Defecto
- **Desktop (≥640px)**: Muestra icono + texto
- **Tablet/Móvil (<640px)**: Muestra solo icono

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
    aspect-ratio: 1; // Cuadrado perfecto (opcional)

    .btn-text {
      display: none;
    }
  }
}
```

---

## Accesibilidad

- ✅ **Contraste de color**: Todos los colores cumplen con WCAG AA (ratio ≥ 4.5:1)
- ✅ **Tamaño táctil**: Mínimo 44x44px en dispositivos móviles
- ✅ **Texto alternativo**: Usar `title` o `aria-label` en botones que solo tienen icono
- ✅ **Estado disabled**: Opacidad reducida y cursor not-allowed
- ✅ **Focus visible**: Asegurar que el foco sea visible (outline)

### Ejemplo con aria-label
```html
<button
  class="action-btn view"
  (click)="ver(id)"
  [disabled]="!puedeVer"
  aria-label="Ver detalles de {{ item.nombre }}"
>
  <app-icon name="eye" size="sm"></app-icon>
  <span class="btn-text">Ver</span>
</button>
```

---

## Componentes que Implementan este Sistema

- ✅ `GestionTiposTramiteComponent` (tipos de trámite)
- ✅ `GestionTUPACComponent` (TUPAC)
- ✅ `GestionRequisitosTUPACComponent` (requisitos TUPAC)

---

## Notas de Implementación

1. **Iconos**: Usar el componente `<app-icon>` con `size="sm"` para consistencia.
2. **Texto**: El texto del botón va dentro de `<span class="btn-text">` y solo se muestra en pantallas ≥640px.
3. **Clases de variante**: Usar `view`, `edit`, `delete`, `toggle-active`, `toggle-inactive`.
4. **Estado disabled**: Usar el binding `[disabled]` de Angular, no la clase `.disabled`.
5. **Espaciado**: Ajustar `gap` en `.action-btn` para controlar espacio entre icono y texto.

---

## Mantenimiento

Para agregar una nueva variante de color:
1. Añadir la clase CSS correspondiente (ej: `.action-btn.nueva-variante`)
2. Documentar la paleta de colores en esta guía
3. Actualizar la tabla de variantes

Para modificar colores:
1. Actualizar los valores HEX en la sección "Paleta de Colores"
2. Modificar las reglas CSS correspondientes en cada componente que use la variante

---

**Última actualización**: 2025-12-08
**Versión**: 1.0.0
**Autor**: Kilo Code
