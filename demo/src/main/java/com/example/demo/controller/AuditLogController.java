package com.example.demo.controller;

import com.example.demo.dto.AuditLogFilterRequest;
import com.example.demo.dto.AuditLogResponseDTO;
import com.example.demo.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDTO>> getAllAuditLogs(
            AuditLogFilterRequest filter,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(filter, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{tabla}/{id}")
    public ResponseEntity<Page<AuditLogResponseDTO>> getAuditLogsByRecord(
            @PathVariable String tabla,
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogsByTableAndId(tabla, id, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{tabla}/{id}/detalle")
    public ResponseEntity<Map<String, Object>> getAuditLogDetail(
            @PathVariable String tabla,
            @PathVariable Long id,
            @RequestParam(required = false) Long revision) {
        Map<String, Object> detail = auditLogService.getAuditLogDetail(tabla, id, revision);
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuditLogResponseDTO>> searchAuditLogs(
            AuditLogFilterRequest filter,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(filter, pageable);
        return ResponseEntity.ok(logs);
    }
}