import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,       // 20 usuarios simultáneos
  duration: '20s', // durante 20 segundos
};

export default function () {
  // Endpoint público: lista todos los tipos de trámite (no requiere autenticación)
  let res = http.get('http://localhost:8080/api/tipos-tramite/publico');
  check(res, {
    'status 200': (r) => r.status === 200,
    'respuesta es array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  sleep(1);
}
