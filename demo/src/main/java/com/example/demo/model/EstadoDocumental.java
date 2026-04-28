package com.example.demo.model;

public enum EstadoDocumental {
    PENDIENTE,   // No se ha evaluado
    APTO,        // Documentación completa y válida
    OBSERVADO,   // Documentos con observaciones (requieren corrección)
    NO_APTO      // Documentación incompleta o incorrecta
}

