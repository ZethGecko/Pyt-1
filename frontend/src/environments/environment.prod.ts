export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',
  appName: 'Mi App',
  appVersion: '1.0.0',
  enableDebug: false,
  features: {
    auth: true,
    registration: false, // Deshabilitar registro en prod
    passwordReset: true,
    userProfile: true,
    adminPanel: true
  },
  security: {
    tokenExpiration: 3600, // 1 hora en segundos
    refreshTokenExpiration: 604800, // 7 días
    encryptionKey: 'production-key-change-this'
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  }
};