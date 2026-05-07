import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  vus: 20,
  duration: '20s',
  thresholds: {
    errors: ['rate<0.1'], // menos del 10% de errores
    http_req_duration: ['p(95)<500'], // 95% de las peticiones < 500ms
    response_time: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('http://localhost:8080/api/tipos-tramite/publico');
  
  // Registrar métricas
  responseTime.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  
  check(res, {
    'status 200': (r) => r.status === 200,
    'respuesta es array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  
  sleep(1);
}
