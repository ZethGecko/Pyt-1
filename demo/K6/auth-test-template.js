import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Configuración de autenticación
const BASE_URL = 'http://localhost:8080';
const CREDENTIALS = new SharedArray('credentials', function () {
  return [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' },
  ];
});

// Obtener token JWT
function getAuthToken(username, password) {
  const res = http.post(`${BASE_URL}/api/auth/login`, {
    username: username,
    password: password,
  });
  
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return data.token;
  }
  return null;
}

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  // Usar primera credencial (rotar en implementación real)
  const cred = CREDENTIALS[0];
  const token = getAuthToken(cred.username, cred.password);
  
  if (token) {
    // Ejemplo de endpoint protegido
    const params = { headers: { Authorization: `Bearer ${token}` } };
    const res = http.get(`${BASE_URL}/api/tramites`, params);
    check(res, { 'status 200': (r) => r.status === 200 });
  }
  
  sleep(1);
}
