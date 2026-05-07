# Pruebas de Estrés y Carga con K6

Este directorio contiene scripts para probar el rendimiento de la API del sistema de transporte.

## Endpoints Públicos (Sin Autenticación)

Los siguientes endpoints están disponibles para pruebas sin necesidad de token JWT:

1. **GET** `/api/tipos-tramite/publico` - Lista todos los tipos de trámite con sus requisitos
2. **GET** `/api/tramites/publico/seguimiento/{codigoRUT}` - Obtiene seguimiento completo de un trámite
3. **GET** `/api/publicaciones/publicadas` - Lista todas las publicaciones publicadas

## Scripts Disponibles

### 1. smoke-test.js
**Propósito**: Verificar que los endpoints responden correctamente.
**Configuración**:
- 20 usuarios simultáneos
- Duración: 20 segundos
- Endpoint: `/api/tipos-tramite/publico`

**Ejecución**:
```bash
k6 run smoke-test.js
```

### 2. load-test.js
**Propósito**: Probar comportamiento con carga moderada.
**Configuración**:
- 1 usuario concurrente
- Duración: 5 segundos
- Endpoint: `/api/tramites/publico/seguimiento/EXAMPLE-001`

**Nota**: El código RUT `EXAMPLE-001` es creado automáticamente por `DataInitializer`. Si tienes otros datos, modifica el script.

**Ejecución**:
```bash
k6 run load-test.js
```

### 3. stress-test.js
**Propósito**: Prueba de estrés con aumento progresivo de carga.
**Configuración**:
- Etapas:
  - 1 minuto a 100 VUs
  - 1 minuto a 300 VUs
  - 1 minuto a 600 VUs
  - 1 minuto a 1000 VUs
  - 1 minuto a 0 VUs (enfriamiento)
- Endpoint: `/api/tipos-tramite/publico`

**Ejecución**:
```bash
k6 run stress-test.js
```

### 4. smoke-test-with-metrics.js (Opcional)
**Propósito**: Prueba de humo con métricas personalizadas y umbrales.
**Métricas**:
- Tasa de errores (debe ser < 10%)
- Tiempo de respuesta P95 (debe ser < 500ms)

**Ejecución**:
```bash
k6 run smoke-test-with-metrics.js
```

### 5. auth-test-template.js (Plantilla)
**Propósito**: Plantilla para pruebas con autenticación JWT.
**Nota**: Requiere credenciales válidas configuradas en el array CREDENTIALS.

**Ejecución**:
```bash
k6 run auth-test-template.js
```

## Interpretación de Resultados

K6 mostrará en consola:
- **VUs**: Virtual Users (usuarios virtuales)
- **HTTP Req/sec**: Peticiones por segundo
- **Duration**: Tiempo de respuesta (min/avg/max)
- **Status**: Códigos HTTP (200, 404, 500, etc.)
- **Errors**: Porcentaje de peticiones fallidas

### Umbrales recomendados
- Tasa de error: < 1% (producción), < 5% (pruebas)
- Tiempo de respuesta P95: < 500ms (API simple)
- Throughput: Mantenerse estable durante la carga

## Consideraciones

1. **Base de datos**: Asegúrate de que PostgreSQL esté corriendo y con datos suficientes.
2. **Puerto**: La aplicación debe estar en `http://localhost:8080`. Modifica los scripts si usas otro puerto.
3. **Recursos**: Monitorea CPU y memoria del servidor durante las pruebas.
4. **Entorno**: Ejecuta estas pruebas en un entorno similar a producción.

## Pruebas por Flujo

Para probar flujos completos (múltiples endpoints en secuencia), crea un script que:
1. Obtenga lista de tipos de trámite
2. Seleccione un tipo y consulte sus requisitos
3. Simule un seguimiento de trámite

Ejemplo de flujo:
```javascript
// 1. GET /api/tipos-tramite/publico
// 2. GET /api/tipos-tramite/{id}
// 3. GET /api/tramites/publico/seguimiento/{codigoRUT}
```

## Generación de Reportes

Para generar reportes en HTML:
```bash
k6 run --out json=results.json smoke-test.js
k6 report results.json
```

Para exportar a CSV:
```bash
k6 run --out csv=results.csv stress-test.js
```
