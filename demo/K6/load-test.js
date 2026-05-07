import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',
};

export default function () {
  // Endpoint público: seguimiento de trámite por código RUT
  // Usa EXAMPLE-001 (código de prueba creado por DataInitializer)
  let res = http.get('http://localhost:8080/api/tramites/publico/seguimiento/EXAMPLE-001');
  
  // El endpoint puede retornar 200 con datos o 404 si no existe
  // Ambos son válidos para medir rendimiento del sistema
  check(res, {
    'status válido': (r) => r.status === 200 || r.status === 404,
    'respuesta es objeto o null': (r) => {
      const body = JSON.parse(r.body);
      return body === null || typeof body === 'object';
    }
  });
}
