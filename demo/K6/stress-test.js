import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 600 },
    { duration: '1m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  // Endpoint público: lista de tipos de trámite
  http.get('http://localhost:8080/api/tipos-tramite/publico');
  sleep(1);
}
