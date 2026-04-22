// environments/environment.ts
export const environment = {
  production: false,
   apiUrl: 'http://localhost:8080/api',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    validate: '/auth/validate',
    profile: '/users/profile'
  },
  public: {
    seguimiento: '/public/tramites',
    publicaciones: '/public/publicaciones',
    informacion: '/public/informacion'
  },
  token: {
    storageKey: 'auth_token',
    refreshKey: 'refresh_token',
    userKey: 'user_data'
  },
  routes: {
    login: '/auth/login',
    dashboard: '/dashboard',
    forbidden: '/403',
    public: '/'
  }
};