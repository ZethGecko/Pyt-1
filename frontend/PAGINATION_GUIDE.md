# Guía de Implementación de Paginación

## Descripción
Esta guía explica cómo implementar paginación client-side en componentes Angular con tablas de datos, siguiendo el patrón establecido en el proyecto.

## Estructura de Paginación Implementada

### 1. Variables de Paginación (en la clase del componente)

```typescript
// Número de página actual (comienza en 1)
paginaActual = 1;

// Items por página (recomendado: 15)
itemsPorPagina = 15;

// Getter para calcular total de páginas
get paginasTotales(): number {
  const datosFiltrados = this.getDatosFiltrados(); // Método que devuelve datos filtrados
  return Math.ceil(datosFiltrados.length / this.itemsPorPagina);
}

// Getter para obtener solo los items de la página actual
get datosPaginados(): TipoDato[] {
  const datosFiltrados = this.getDatosFiltrados();
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  return datosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
}
```

### 2. Método para Cambiar de Página

```typescript
cambiarPagina(pagina: number) {
  this.paginaActual = pagina;
}
```

### 3. Modificación en el Template

#### Cambiar la fuente de datos en la tabla:

**ANTES:**
```angular
@for (item of getDatosFiltrados(); track item.id) {
```

**DESPUÉS:**
```angular
@for (item of datosPaginados; track item.id) {
```

#### Agregar controles de paginación después de la tabla:

```angular
<!-- PAGINACIÓN -->
@if (paginasTotales > 1) {
  <div class="pagination">
    <button (click)="cambiarPagina(paginaActual - 1)" 
            [disabled]="paginaActual === 1" 
            class="btn btn-outline btn-sm">
      Anterior
    </button>
    
    <span class="pagination-info">
      Página {{paginaActual}} de {{paginasTotales}} 
      ({{getDatosFiltrados().length}} registros)
    </span>
    
    <button (click)="cambiarPagina(paginaActual + 1)" 
            [disabled]="paginaActual === paginasTotales" 
            class="btn btn-outline btn-sm">
      Siguiente
    </button>
  </div>
}
```

### 4. Resetear Página al Cambiar Filtros

Cuando se aplican filtros, es importante resetear a la página 1 para evitar mostrar páginas vacías:

```typescript
aplicarFiltros() {
  this.paginaActual = 1; // Resetear a primera página
  // ... resto de lógica de filtrado
}
```

## Ejemplo Completo: GestionTUPACComponent

### TypeScript (gestion-tupac.component.ts)

```typescript
@Component({
  // ...
})
export class GestionTUPACComponent implements OnInit {
  tupacs: TUPAC[] = [];
  
  // Variables de paginación
  paginaActual = 1;
  itemsPorPagina = 15;
  
  get paginasTotales(): number {
    const tupacsFiltrados = this.getTupacsFiltrados();
    return Math.ceil(tupacsFiltrados.length / this.itemsPorPagina);
  }
  
  get tupacsPaginados(): TUPAC[] {
    const tupacsFiltrados = this.getTupacsFiltrados();
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return tupacsFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }
  
  // Método para cambiar página
  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }
  
  // Método de filtrado existente
  getTupacsFiltrados(): TUPAC[] {
    return this.tupacs.filter(t => {
      const coincideBusqueda = !this.filtro ||
        t.codigo.toLowerCase().includes(this.filtro.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.filtro.toLowerCase());
      const coincideCategoria = !this.filtroCategoria || t.categoria === this.filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }
  
  // Resetear página al cargar datos
  cargarTupacs() {
    this.paginaActual = 1;
    this.tupacService.getAll().subscribe({
      next: (data) => {
        this.tupacs = data;
      },
      error: (err) => {
        console.error('Error cargando TUPACs:', err);
      }
    });
  }
}
```

### Template (gestion-tupac.component.ts - inline template)

```angular
<!-- Tabla -->
@if (cargando) {
  <!-- Loading state -->
} @else {
  <div class="table-card">
    <table class="data-table">
      <!-- Encabezados -->
      <tbody>
        @for (tupac of tupacsPaginados; track tupac.id) {
          <!-- Filas -->
        }
      </tbody>
    </table>
  </div>
  
  <!-- Controles de paginación -->
  @if (paginasTotales > 1) {
    <div class="pagination">
      <button (click)="cambiarPagina(paginaActual - 1)" 
              [disabled]="paginaActual === 1" 
              class="btn btn-outline btn-sm">
        Anterior
      </button>
      
      <span class="pagination-info">
        Página {{paginaActual}} de {{paginasTotales}} 
        ({{getTupacsFiltrados().length}} registros)
      </span>
      
      <button (click)="cambiarPagina(paginaActual + 1)" 
              [disabled]="paginaActual === paginasTotales" 
              class="btn btn-outline btn-sm">
        Siguiente
      </button>
    </div>
  }
}
```

## Estilos CSS Recomendados

Agregar en la sección `styles` del componente o en el archivo SCSS correspondiente:

```scss
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  
  .pagination-info {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .btn-outline {
    background-color: white;
    border: 1px solid #d1d5db;
    color: #374151;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
```

## Consideraciones Importantes

1. **Client-side vs Server-side**: Esta implementación es para paginación del lado del cliente (todos los datos ya están cargados). Para grandes volúmenes de datos, se recomienda paginación server-side.

2. **Sincronización con Filtros**: Los getters `paginasTotales` y `datosPaginados` usan `getDatosFiltrados()` para asegurar que la paginación se calcule sobre los datos ya filtrados.

3. **Reset Automático**: Al cambiar de página y luego aplicar un filtro, se recomienda resetear `paginaActual = 1` en el método que aplica los filtros.

4. **Performance**: El uso de getters asegura que los cálculos se realicen solo cuando se accede a las propiedades, manteniendo los datos actualizados automáticamente.

5. **Compatibilidad**: Esta implementación funciona con:
   - Angular 17+ (sintaxis de control de flujo `@if`, `@for`)
   - Standalone components
   - Change Detection por defecto

## Archivos Modificados como Referencia

- `frontend/src/app/modules/configuracion/pages/gestion-tupac.component.ts`
- `frontend/src/app/modules/configuracion/pages/gestion-requisitos-tupac.component.ts`

Ambos componentes implementan el mismo patrón con 15 items por página.

## Checklist de Implementación

- [ ] Agregar variables `paginaActual` y `itemsPorPagina`
- [ ] Crear getter `paginasTotales`
- [ ] Crear getter `datosPaginados`
- [ ] Modificar el `@for` en el template para usar `datosPaginados`
- [ ] Agregar método `cambiarPagina(pagina: number)`
- [ ] Resetear `paginaActual = 1` al cargar o filtrar datos
- [ ] Agregar controles de paginación en el template
- [ ] Agregar estilos CSS para la paginación
- [ ] Probar que la paginación funciona correctamente con filtros

## Notas Adicionales

- El número de items por página (15) puede ajustarse según necesidades
- Para datos muy grandes (>1000 registros), considerar implementar paginación server-side
- La paginación se recalcula automáticamente cuando cambian los filtros gracias a los getters
- Mantener la consistencia usando siempre los mismos nombres de variables y métodos

## ⚡ Patrón de Carga Optimizada (Actualizaciones sin Recarga Completa)

### Problema Común

Después de operaciones CRUD (crear, editar, eliminar), algunos componentes recargan **todos** los datos (múltiples entidades) en lugar de solo lo necesario, causando:
- Vista lenta al actualizar
- Carga innecesaria de datos que no cambiaron
- Mala experiencia de usuario

### Solución: Métodos de Carga Específicos

En lugar de tener un solo método `cargarDatosIniciales()` que carga todo, crear métodos específicos:

```typescript
// 1. Cargar TODO (solo al iniciar el componente)
cargarDatosIniciales(): void {
  this.cargando = true;
  
  forkJoin({
    empresas: this.empresaService.listarTodos(),
    gerentes: this.gerenteService.listarProjectedConPoderVigente(),
    subtipos: this.subtipoService.getAll()
  }).subscribe({
    next: (resultado) => {
      this.empresas = resultado.empresas;
      this.gerentes = resultado.gerentes;
      this.gerentesDisponibles = resultado.gerentes;
      this.subtiposTransporte = resultado.subtipos;
      this.cargando = false;
      this.changeDetectorRef.detectChanges(); // ← Forzar actualización de vista
    },
    error: (err) => {
      this.cargando = false;
      this.changeDetectorRef.detectChanges();
      this.notificationService.error('Error al cargar datos', 'Error');
    }
  });
}

// 2. Cargar solo EMPRESAS (para operaciones CRUD de empresas)
cargarEmpresas(): void {
  this.cargando = true;
  
  this.empresaService.listarTodos().subscribe({
    next: (data: EmpresaResponse[]) => {
      this.empresas = data;
      this.cargando = false;
      this.changeDetectorRef.detectChanges(); // ← Forzar actualización de vista
    },
    error: (err) => {
      this.cargando = false;
      this.changeDetectorRef.detectChanges();
      this.notificationService.error('Error al cargar empresas', 'Error');
    }
  });
}

// 3. Cargar EMPRESAS + GERENTES (para operaciones CRUD de gerentes)
cargarEmpresasYGerentes(): void {
  this.cargando = true;
  
  forkJoin({
    empresas: this.empresaService.listarTodos(),
    gerentes: this.gerenteService.listarProjectedConPoderVigente()
  }).subscribe({
    next: (resultado) => {
      this.empresas = resultado.empresas;
      this.gerentes = resultado.gerentes;
      this.gerentesDisponibles = resultado.gerentes;
      this.cargando = false;
      this.changeDetectorRef.detectChanges(); // ← Forzar actualización de vista
    },
    error: (err) => {
      this.cargando = false;
      this.changeDetectorRef.detectChanges();
      this.notificationService.error('Error al cargar datos', 'Error');
    }
  });
}
```

### Uso en Operaciones CRUD

```typescript
// ✅ Operaciones de EMPRESAS → usar cargarEmpresas()
crearEmpresa(): void {
  this.empresaService.crear(data).subscribe({
    next: () => {
      this.notificationService.success('Empresa creada', 'Éxito');
      this.cerrarModal();
      this.cargarEmpresas(); // ← Solo recarga empresas
    },
    error: (err) => {
      this.notificationService.error('Error al crear', 'Error');
    }
  });
}

actualizarEmpresa(): void {
  this.empresaService.actualizar(id, data).subscribe({
    next: () => {
      this.notificationService.success('Empresa actualizada', 'Éxito');
      this.cerrarModal();
      this.cargarEmpresas(); // ← Solo recarga empresas
    },
    error: (err) => {
      this.notificationService.error('Error al actualizar', 'Error');
    }
  });
}

activarEmpresa(): void {
  this.empresaService.activar(id).subscribe({
    next: () => {
      this.notificationService.success('Empresa activada', 'Éxito');
      this.cargarEmpresas(); // ← Solo recarga empresas
    },
    error: (err) => {
      this.notificationService.error('Error al activar', 'Error');
    }
  });
}

// ✅ Operaciones de GERENTES → usar cargarEmpresasYGerentes()
guardarGerente(): void {
  if (this.gerenteEditandoId) {
    this.gerenteService.actualizar(id, data).subscribe({
      next: () => {
        this.notificationService.success('Gerente actualizado', 'Éxito');
        this.cerrarModalGerente();
        this.cargarEmpresasYGerentes(); // ← Recarga empresas y gerentes
      },
      error: (err) => {
        this.notificationService.error('Error al actualizar', 'Error');
      }
    });
  } else {
    this.gerenteService.crear(data).subscribe({
      next: (gerente) => {
        this.notificationService.success('Gerente creado', 'Éxito');
        this.formulario.gerenteId = gerente.id;
        this.cerrarModalGerente();
        this.cargarEmpresasYGerentes(); // ← Recarga empresas y gerentes
      },
      error: (err) => {
        this.notificationService.error('Error al crear', 'Error');
      }
    });
  }
}

eliminarGerente(): void {
  this.gerenteService.eliminar(id).subscribe({
    next: () => {
      this.notificationService.success('Gerente eliminado', 'Éxito');
      this.cargarEmpresasYGerentes(); // ← Recarga empresas y gerentes
      this.cerrarListaGerentes();
    },
    error: (err) => {
      this.notificationService.error('Error al eliminar', 'Error');
    }
  });
}
```

### Inyección de `ChangeDetectorRef`

**Importante**: Agregar `ChangeDetectorRef` al constructor para forzar la detección de cambios:

```typescript
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  // ...
})
export class GestionEmpresasComponent implements OnInit {
  constructor(
    private empresaService: EmpresaService,
    private gerenteService: GerenteService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef // ← Agregar
  ) {}
  
  // ...
}
```

### Beneficios

- ✅ **Actualizaciones más rápidas**: Solo se recarga lo necesario
- ✅ **Mejor UX**: La vista se actualiza inmediatamente sin demoras
- ✅ **Menos tráfico**: Se reducen las llamadas al backend
- ✅ **Escalable**: Fácil de agregar nuevos métodos específicos

### Cuándo Usar Cada Método

| Método | Cuándo usarlo |
|--------|---------------|
| `cargarDatosIniciales()` | Solo en `ngOnInit()` para cargar todo al inicio |
| `cargarEmpresas()` | Después de cualquier operación CRUD de **empresas** |
| `cargarEmpresasYGerentes()` | Después de cualquier operación CRUD de **gerentes** |
| `cargarSubtiposTransporte()` | Solo si se modifica un subtipo (raro) |

### Referencia de Implementación

Este patrón está implementado en:
- `frontend/src/app/modules/empresas/pages/gestion-empresas.component.ts`
- `frontend/src/app/modules/configuracion/pages/gestion-tupac.component.ts` (versión simplificada)

En TUPAC solo existe `cargarTupacs()` porque no depende de otras entidades.

### Checklist de Implementación

- [ ] Inyectar `ChangeDetectorRef` en el constructor
- [ ] Crear método `cargarEmpresas()` que solo carga empresas
- [ ] Crear método `cargarEmpresasYGerentes()` que carga empresas + gerentes
- [ ] Mantener `cargarDatosIniciales()` solo para `ngOnInit()`
- [ ] Agregar `this.changeDetectorRef.detectChanges()` en todos los métodos de carga
- [ ] Reemplazar `cargarDatosIniciales()` por `cargarEmpresas()` en CRUD de empresas
- [ ] Reemplazar `cargarDatosIniciales()` por `cargarEmpresasYGerentes()` en CRUD de gerentes
- [ ] Probar que las actualizaciones son inmediatas y no recargan datos innecesarios
