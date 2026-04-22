# Propuesta de eliminación de archivos y carpetas innecesarias

## Archivos y carpetas que SE PUEDEN eliminar (no son necesarios para el funcionamiento):

### Directorios de desarrollo/Kilo (no parte del proyecto):
- `.kilo/` - Configuración del asistente Kilo, no parte del código fuente del proyecto
- `.kilocode/` - Similar al anterior, residuos del entorno de desarrollo

### Cachés y archivos temporales:
- `__pycache__/` - Caché de bytecode de Python, se regenera automáticamente
- `node_modules/` (en raíz) - Los módulos de Node reales están en frontend/ y posiblemente demo/
- Archivos `*.log`:
  - `app.log`
  - `app_start.log` 
  - `app_start_final.log`
  - `hs_err_pid44120.log`
  - `replay_pid44120.log`
  - En demo/: `backend.log`, `backend_full.log`, `backend_output.log`, `startup.log`
- Archivos temporales:
  - `temp1.txt`
  - `temp_insert.txt`
  - `temp_userservice.txt`
  - `temp.txt` (en frontend/)
  - `nul` (múltiples instancias)
  - `check_braces.ps1`
  - `count-braces.js`
  - `xd.txt`

### Copias de seguridad y respaldos (deben estar en backup separado, no en código fuente):
- `backup.sql`
- `backup_utf8.sql`

### Scripts SQL sueltos (mejor mantenerlos en una carpeta de docs/scripts si son importantes):
- `agregar_columna_tupac.sql`

### Documentación y guías (pueden moverse a wiki o docs/ si son valiosas):
- En frontend/ varios archivos `.md` que parecen guías de desarrollo:
  - `ACTION_BUTTONS_GUIDE.md`
  - `BUTTON_STYLES_GUIDE.md`
  - `PAGINATION_GUIDE.md`
  - `README_NOTIFICATIONS.md`
  - (README.md sí debería mantenerse)

### Otros:
- `.vscode/` (en raíz y en subdirectorios) - Configuración del IDE, personal y no esencial para el funcionamiento
- `.github/` - Directorio vacío, no aporta nada

## Archivos y carpetas que DEBEN mantenerse (esenciales para el funcionamiento):

### Código fuente principal:
- `demo/` - Backend Spring Boot (contiene toda la lógica del servidor)
- `frontend/` - Frontend Angular (contiene toda la lógica de la interfaz de usuario)

### Configuración y despliegue:
- `docker-compose.yml` - Orquesta los servicios (backend, frontend, base de datos)
- `frontend/Dockerfile` - Para construir la imagen del frontend
- `demo/Dockerfile` - Para construir la imagen del backend
- `package.json` (en raíz y en frontend/) - Dependencias de Node.js
- `frontend/package-lock.json` - Bloqueo de versiones consistentes
- `demo/pom.xml` - Dependencias de Maven para el backend
- `tsconfig.json` y relacionados - Configuración de TypeScript
- `tailwind.config.js` - Configuración de Tailwind CSS

### Control de versiones (esencial para colaboración):
- `.git/` - Repositorio Git

### Configuración mínima de entorno:
- Archivos `.gitignore` apropiados en cada directorio