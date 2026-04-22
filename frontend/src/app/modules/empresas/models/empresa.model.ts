// ==========================================
// EMPRESA - Frontend Model corregido para coincidir con Backend
// ==========================================

export interface Empresa {
  id: number;
  nombre: string;           // Mapea a: nombre (backend)
  codigo?: string;          // Mapea a: codigo (backend) - único
  ruc: string;              // Mapea a: ruc (backend)
  contactoTelefono?: string; // Mapea a: contactoTelefono (backend) - teléfono de contacto de la empresa
  direccionLegal: string;   // Mapea a: direccionLegal (backend)
  email?: string;           // Mapea a: email (backend) - NO existe en backend, verificar
   
  // Relaciones
  gerenteId?: number;       // Mapea a: gerente.id (backend)
  subtipoTransporteId?: number; // Mapea a: subtipoTransporte.id (backend)
  
  // Configuración operativa
  tipoTrayectoria?: string; // 'ruta' | 'paradero'
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  
  // Vigencia
  inicioVigencia?: Date;
  finVigencia?: Date;
  activo: boolean;           // Mapea a: activo (backend)
  estadoOperativo?: string;  // 'habilitada' | 'suspendida' | 'en_proceso' | 'inhabilitada'
  
  // Auditoría
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  
  // Extras (del projection)
  observaciones?: string;
  
  // Info calculada del projection
  porcentajeHabilitacion?: number;
  tieneVigenciaActiva?: boolean;
  estadoVigencia?: string;
  puedeOperar?: boolean;
  requiereActualizacion?: boolean;
  estadoGeneral?: string;
  jerarquiaTransporte?: string;
  informacionGerente?: string;
  infoVigencia?: string;
  
  // Info del gerente (del projection)
  gerente?: {
    id: number;
    nombre: string;
    dni?: number;
    tienePoderVigente?: boolean;
  };
  
  // Info del subtipo (del projection)
  subtipoTransporte?: {
    id: number;
    nombre: string;
    tipoTransporte?: {
      id: number;
      nombre: string;
      categoriaTransporte?: {
        id: number;
        nombre: string;
      };
    };
  };
}

export interface EmpresaCreateRequest {
  nombre: string;
  codigo?: string;
  ruc: string;
  contactoTelefono?: string;
  direccionLegal: string;
  email?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date;
  finVigencia?: Date;
  activo?: boolean;
  estadoOperativo?: string;
  observaciones?: string;
}

export interface EmpresaUpdateRequest {
  nombre?: string;
  codigo?: string;
  contactoTelefono?: string;
  direccionLegal?: string;
  email?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date;
  finVigencia?: Date;
  activo?: boolean;
  estadoOperativo?: string;
  observaciones?: string;
}

// PROYECCIÓN ENRIQUECIDA DEL BACKEND
export interface EmpresaProjection {
  id: number;
  nombre: string;
  codigo: string;
  ruc: string;
  contactoTelefono?: string;
  direccionLegal?: string;
  tipoTrayectoria?: string;
  numeroResolucion?: string;
  unidadesVehiculares?: number;
  unidadesHabilitadas?: number;
  inicioVigencia?: Date;
  finVigencia?: Date;
  activo?: boolean;
  estadoOperativo?: string;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  
  // Calculados
  porcentajeHabilitacion?: number;
  tieneVigenciaActiva?: boolean;
  estadoVigencia?: string;
  puedeOperar?: boolean;
  requiereActualizacion?: boolean;
  estadoGeneral?: string;
  jerarquiaTransporte?: string;
  informacionGerente?: string;
  infoVigencia?: string;
  
  // Relaciones
  gerente?: {
    id: number;
    nombre: string;
    dni?: number;
    tienePoderVigente?: boolean;
  };
  subtipoTransporte?: {
    id: number;
    nombre: string;
    tipoTransporte?: {
      id: number;
      nombre: string;
      categoriaTransporte?: {
        id: number;
        nombre: string;
      };
    };
  };
}

// ESTADOS para dropdowns
export const ESTADOS_EMPRESA = {
  OPERATIVO: ['habilitada', 'suspendida', 'en_proceso', 'inhabilitada'],
  VIGENCIA: ['VIGENTE', 'VIGENTE_SIN_FIN', 'POR_VENCER', 'VENCIDA'],
  GENERAL: ['OPERATIVA', 'NO_OPERATIVA', 'REQUIERE_ATENCION', 'INACTIVA'],
};

// FILTROS
export interface FiltrosEmpresa {
  search?: string;
  estadoOperativo?: string;
  tipoTrayectoria?: string;
  activa?: boolean;
  nombre?: string;
  ruc?: string;
  gerenteId?: number;
  subtipoTransporteId?: number;
}
