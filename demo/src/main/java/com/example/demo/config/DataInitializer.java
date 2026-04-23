package com.example.demo.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.CategoriaTransporte;
import com.example.demo.model.Departamento;
import com.example.demo.model.Empresa;
import com.example.demo.model.Formatos;
import com.example.demo.model.Gerente;
import com.example.demo.model.PersonaNatural;
import com.example.demo.model.PuntoRuta;
import com.example.demo.model.RequisitoTUPAC;
import com.example.demo.model.Roles;
import com.example.demo.model.Ruta;
import com.example.demo.model.SubtipoTransporte;
import com.example.demo.model.TUPAC;
import com.example.demo.model.TipoTramite;
import com.example.demo.model.TipoTransporte;
import com.example.demo.model.Tramite;
import com.example.demo.model.Users;
import com.example.demo.repository.CategoriaTransporteRepository;
import com.example.demo.repository.DepartamentoRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.FormatosRepository;
import com.example.demo.repository.GerenteRepository;
import com.example.demo.repository.PersonaNaturalRepository;
import com.example.demo.repository.PuntoRutaRepository;
import com.example.demo.repository.RequisitoTUPACRepository;
import com.example.demo.repository.RolesRepository;
import com.example.demo.repository.RutaRepository;
import com.example.demo.repository.SubtipoTransporteRepository;
import com.example.demo.repository.TUCRepository;
import com.example.demo.repository.TUPACRepository;
import com.example.demo.repository.TipoTramiteRepository;
import com.example.demo.repository.TipoTransporteRepository;
import com.example.demo.repository.TramiteRepository;
import com.example.demo.repository.UsersRepository;
import com.example.demo.repository.VehiculoRepository;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DataInitializer {

      @Autowired private RolesRepository rolesRepository;
       @Autowired private DepartamentoRepository departamentoRepository;
       @Autowired private UsersRepository usersRepository;
        @Autowired private EmpresaRepository empresaRepository;
        @Autowired private GerenteRepository gerenteRepository;
        @Autowired private PersonaNaturalRepository personaNaturalRepository;
      @Autowired private PasswordEncoder passwordEncoder;
      @Autowired private TUPACRepository tupacRepository;
      @Autowired private RequisitoTUPACRepository requisitoTUPACRepository;
      @Autowired private FormatosRepository formatosRepository;
      @Autowired private TipoTramiteRepository tipoTramiteRepository;
       @Autowired private CategoriaTransporteRepository categoriaTransporteRepository;
       @Autowired private TipoTransporteRepository tipoTransporteRepository;
       @Autowired private SubtipoTransporteRepository subtipoTransporteRepository;
       @Autowired private VehiculoRepository vehiculoRepository;
       @Autowired private PuntoRutaRepository puntoRutaRepository;
       @Autowired private RutaRepository rutaRepository;
       @Autowired private TUCRepository tucRepository;
        @Autowired private com.example.demo.service.TramiteService tramiteService;
        @Autowired private TramiteRepository tramiteRepository;

        @PersistenceContext
        private EntityManager entityManager;

    @PostConstruct
    @Transactional
    public void initData() {

        // 1. Crear/asegurar roles ADMIN y SUPER_ADMIN con permisos completos
        Roles adminRole = createOrUpdateRole("ADMIN", "Administrador del sistema");
        Roles superAdminRole = createOrUpdateRole("SUPER_ADMIN", "Super Administrador del sistema");

        // 2. Crear departamentos si no existen
        if (departamentoRepository.count() == 0L) {
            Departamento depto1 = new Departamento();
            depto1.setNombre("Departamento Administrativo");
            depto1.setDescripcion("Departamento para administradores");
            depto1.setActivo(true);
            depto1.setFechaCreacion(LocalDateTime.now());
            departamentoRepository.save(depto1);

            Departamento depto2 = new Departamento();
            depto2.setNombre("Departamento Técnico");
            depto2.setDescripcion("Departamento para técnicos y super administradores");
            depto2.setActivo(true);
            depto2.setFechaCreacion(LocalDateTime.now());
            departamentoRepository.save(depto2);

            System.out.println("Departamentos creados");
        }

        // 2.1. Inicializar datos de Categorías de Transporte
        if (categoriaTransporteRepository.count() == 0L) {
            CategoriaTransporte cat1 = new CategoriaTransporte();
            cat1.setNombre("PERSONAS");
            categoriaTransporteRepository.save(cat1);
            
            CategoriaTransporte cat2 = new CategoriaTransporte();
            cat2.setNombre("MERCANCIAS");
            categoriaTransporteRepository.save(cat2);
            System.out.println("Categorías de transporte creadas");
        }

        // 2.2. Inicializar datos de Tipos de Transporte
        if (tipoTransporteRepository.count() == 0L) {
            // Obtener categorías por nombre
            CategoriaTransporte catPersonas = categoriaTransporteRepository.findAll().stream()
                .filter(c -> "PERSONAS".equals(c.getNombre()))
                .findFirst()
                .orElse(null);
            CategoriaTransporte catMercancias = categoriaTransporteRepository.findAll().stream()
                .filter(c -> "MERCANCIAS".equals(c.getNombre()))
                .findFirst()
                .orElse(null);
            
            if (catPersonas != null) {
                TipoTransporte t1 = new TipoTransporte();
                t1.setNombre("REGULAR");
                t1.setCategoriaTransporte(catPersonas);
                tipoTransporteRepository.save(t1);
                
                TipoTransporte t2 = new TipoTransporte();
                t2.setNombre("ESPECIAL");
                t2.setCategoriaTransporte(catPersonas);
                tipoTransporteRepository.save(t2);
                
                TipoTransporte t3 = new TipoTransporte();
                t3.setNombre("COMPLEMENTARIOS");
                t3.setCategoriaTransporte(catPersonas);
                tipoTransporteRepository.save(t3);
            }
            
            if (catMercancias != null) {
                TipoTransporte t4 = new TipoTransporte();
                t4.setNombre("ESPECIAL");
                t4.setCategoriaTransporte(catMercancias);
                tipoTransporteRepository.save(t4);
                
                TipoTransporte t5 = new TipoTransporte();
                t5.setNombre("GENERAL");
                t5.setCategoriaTransporte(catMercancias);
                tipoTransporteRepository.save(t5);
            }
            System.out.println("Tipos de transporte creados");
        }

        // 2.3. Inicializar datos de Subtipos de Transporte
        if (subtipoTransporteRepository.count() == 0L) {
            // Obtener categorías para filtrar tipos
            Optional<CategoriaTransporte> catPersonasOpt = categoriaTransporteRepository.findAll().stream()
                .filter(c -> "PERSONAS".equals(c.getNombre()))
                .findFirst();
            Optional<CategoriaTransporte> catMercanciasOpt = categoriaTransporteRepository.findAll().stream()
                .filter(c -> "MERCANCIAS".equals(c.getNombre()))
                .findFirst();
            
            // Obtener tipos por nombre y categoría
            TipoTransporte tipoRegular = tipoTransporteRepository.findAll().stream()
                .filter(t -> "REGULAR".equals(t.getNombre()))
                .findFirst()
                .orElse(null);
            
            // ESPECIAL de PERSONAS
            TipoTransporte tipoEspecialPersonas = null;
            if (catPersonasOpt.isPresent()) {
                tipoEspecialPersonas = tipoTransporteRepository.findAll().stream()
                    .filter(t -> "ESPECIAL".equals(t.getNombre()) && 
                        t.getCategoriaTransporte() != null && 
                        catPersonasOpt.get().equals(t.getCategoriaTransporte()))
                    .findFirst()
                    .orElse(null);
            }
            
            TipoTransporte tipoComplementarios = tipoTransporteRepository.findAll().stream()
                .filter(t -> "COMPLEMENTARIOS".equals(t.getNombre()))
                .findFirst()
                .orElse(null);
            
            // GENERAL de MERCANCIAS
            TipoTransporte tipoGeneralMercancias = null;
            if (catMercanciasOpt.isPresent()) {
                tipoGeneralMercancias = tipoTransporteRepository.findAll().stream()
                    .filter(t -> "GENERAL".equals(t.getNombre()) && 
                        t.getCategoriaTransporte() != null && 
                        catMercanciasOpt.get().equals(t.getCategoriaTransporte()))
                    .findFirst()
                    .orElse(null);
            }
            
            if (tipoRegular != null) {
                SubtipoTransporte st1 = new SubtipoTransporte();
                st1.setNombre("URBANO");
                st1.setTipoTransporte(tipoRegular);
                subtipoTransporteRepository.save(st1);
                
                SubtipoTransporte st2 = new SubtipoTransporte();
                st2.setNombre("INTERURBANO");
                st2.setTipoTransporte(tipoRegular);
                subtipoTransporteRepository.save(st2);
            }
            
            if (tipoEspecialPersonas != null) {
                SubtipoTransporte st3 = new SubtipoTransporte();
                st3.setNombre("TAXI");
                st3.setTipoTransporte(tipoEspecialPersonas);
                subtipoTransporteRepository.save(st3);
                
                SubtipoTransporte st4 = new SubtipoTransporte();
                st4.setNombre("ESCOLAR");
                st4.setTipoTransporte(tipoEspecialPersonas);
                subtipoTransporteRepository.save(st4);
                
                SubtipoTransporte st5 = new SubtipoTransporte();
                st5.setNombre("TRABAJADORES");
                st5.setTipoTransporte(tipoEspecialPersonas);
                subtipoTransporteRepository.save(st5);
            }
            
            if (tipoComplementarios != null) {
                SubtipoTransporte st6 = new SubtipoTransporte();
                st6.setNombre("MOTOTAXI");
                st6.setTipoTransporte(tipoComplementarios);
                subtipoTransporteRepository.save(st6);
            }
            
            if (tipoGeneralMercancias != null) {
                SubtipoTransporte st7 = new SubtipoTransporte();
                st7.setNombre("MUDANZA");
                st7.setTipoTransporte(tipoGeneralMercancias);
                subtipoTransporteRepository.save(st7);
                
                SubtipoTransporte st8 = new SubtipoTransporte();
                st8.setNombre("MOTO CARGA");
                st8.setTipoTransporte(tipoGeneralMercancias);
                subtipoTransporteRepository.save(st8);
                
                SubtipoTransporte st9 = new SubtipoTransporte();
                st9.setNombre("VOLQUETEROS");
                st9.setTipoTransporte(tipoGeneralMercancias);
                subtipoTransporteRepository.save(st9);
            }
            System.out.println("Subtipos de transporte creados");
        }

        // 2.4. Inicializar datos de Vehículos - skipped for now due to TUC dependency

        // 2.5. Agregar columna kml_content a tabla ruta si no existe
        try {
            entityManager.createNativeQuery("ALTER TABLE ruta ADD COLUMN IF NOT EXISTS kml_content TEXT").executeUpdate();
            System.out.println("Columna kml_content agregada a tabla ruta");
        } catch (Exception e) {
            System.out.println("Columna kml_content ya existe o error al agregar: " + e.getMessage());
        }

        // 2.6. Inicializar datos de Rutas
        if (rutaRepository.count() == 0L) {
            List<Empresa> empresas = empresaRepository.findAll();
            List<Gerente> gerentes = gerenteRepository.findAll();

            if (!empresas.isEmpty() && !gerentes.isEmpty()) {
                Empresa empresa1 = empresas.get(0);
                Gerente gerente1 = gerentes.get(0);
                Users user1 = usersRepository.findByUsername("superadmin");

                Ruta ruta1 = new Ruta();
                ruta1.setCodigo("RUTA-001");
                ruta1.setNombre("Ruta Centro - Norte");
                ruta1.setDescripcion("Ruta desde el centro hacia el norte de la ciudad");
                ruta1.setDistanciaKm(25.5);
                ruta1.setTiempoEstimadoMinutos(45);
                ruta1.setEstado("ACTIVO");
                ruta1.setTipo("URBANO");
                ruta1.setObservaciones("Ruta principal");
                ruta1.setEmpresa(empresa1);
                ruta1.setGerenteResponsable(gerente1);
                ruta1.setUsuarioRegistra(user1);
                ruta1.setFechaRegistro(java.time.LocalDateTime.now());
                rutaRepository.save(ruta1);

                // Crear puntos de ruta para esta ruta
                PuntoRuta punto1 = new PuntoRuta();
                punto1.setNombre("Centro");
                punto1.setDescripcion("Punto de inicio en el centro");
                punto1.setLatitud(-12.0464);
                punto1.setLongitud(-77.0428);
                punto1.setOrden(1);
                punto1.setTipo("ORIGEN");
                punto1.setEstado("ACTIVO");
                punto1.setRuta(ruta1);
                punto1.setEmpresa(empresa1);
                punto1.setUsuarioRegistra(user1);
                punto1.setFechaRegistro(java.time.LocalDateTime.now());
                puntoRutaRepository.save(punto1);

                PuntoRuta punto2 = new PuntoRuta();
                punto2.setNombre("Norte");
                punto2.setDescripcion("Punto final en el norte");
                punto2.setLatitud(-12.0264);
                punto2.setLongitud(-77.0228);
                punto2.setOrden(2);
                punto2.setTipo("DESTINO");
                punto2.setEstado("ACTIVO");
                punto2.setRuta(ruta1);
                punto2.setEmpresa(empresa1);
                punto2.setUsuarioRegistra(user1);
                punto2.setFechaRegistro(java.time.LocalDateTime.now());
                puntoRutaRepository.save(punto2);

                System.out.println("Ruta y puntos de ruta de ejemplo creados");
            }
        }

        // 3. Crear usuarios si no existen
        List<Departamento> deptos = departamentoRepository.findAll();
        if (deptos.size() >= 2) {
            // Usuario superadmin
            if (usersRepository.findByUsername("superadmin") == null) {
                Users superAdmin = new Users();
                superAdmin.setUsername("superadmin");
                superAdmin.setPassword(passwordEncoder.encode("admin123"));
                superAdmin.setEmail("superadmin@test.com");
                superAdmin.setActive(true);
                superAdmin.setRole(superAdminRole);
                superAdmin.setDepartamento(deptos.get(1)); // Departamento Técnico
                superAdmin.setTokenVersion(new Random().nextInt(100000));
                usersRepository.save(superAdmin);
                System.out.println("Usuario superadmin creado (contraseña: admin123)");
            }

            // Usuario admin
            if (usersRepository.findByUsername("admin") == null) {
                Users admin = new Users();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@test.com");
                admin.setActive(true);
                admin.setRole(adminRole);
                admin.setDepartamento(deptos.get(0)); // Departamento Administrativo
                admin.setTokenVersion(new Random().nextInt(100000));
                usersRepository.save(admin);
                System.out.println("Usuario admin creado (contraseña: admin123)");
            }
        } else {
            System.out.println("ERROR: No hay suficientes departamentos para crear usuarios");
        }

        // 3.1. Crear datos de prueba para solicitantes
        if (personaNaturalRepository.count() == 0L) {
            PersonaNatural persona1 = new PersonaNatural();
            persona1.setNombres("Juan");
            persona1.setApellidos("Pérez García");
            persona1.setDni(12345678);
            persona1.setEmail("juan.perez@email.com");
            persona1.setTelefono("987654321");
            persona1.setGenero("M");
            persona1.setFechaRegistro(LocalDateTime.now());
            personaNaturalRepository.save(persona1);

            PersonaNatural persona2 = new PersonaNatural();
            persona2.setNombres("María");
            persona2.setApellidos("López Rodríguez");
            persona2.setDni(87654321);
            persona2.setEmail("maria.lopez@email.com");
            persona2.setTelefono("912345678");
            persona2.setGenero("F");
            persona2.setFechaRegistro(LocalDateTime.now());
            personaNaturalRepository.save(persona2);

            System.out.println("Personas naturales de prueba creadas");
        }

        if (empresaRepository.count() == 0L) {
            Empresa empresa1 = new Empresa();
            empresa1.setNombre("Transportes del Norte S.A.");
            empresa1.setCodigo("TRANS-NORTE-001");
            empresa1.setRuc("20123456789");
            empresa1.setDireccionLegal("Av. Principal 123, Lima");
            empresa1.setEmail("contacto@transportesdelnorte.com");
            empresa1.setContactoTelefono("01-2345678");
            empresa1.setEstadoOperativo("ACTIVO");
            empresa1.setInicioVigencia(LocalDate.now().minusYears(2));
            empresa1.setFinVigencia(LocalDate.now().plusYears(5));
            empresa1.setActivo(true);
            empresa1.setFechaRegistro(LocalDateTime.now());
            empresaRepository.save(empresa1);

            Empresa empresa2 = new Empresa();
            empresa2.setNombre("Logística Express E.I.R.L.");
            empresa2.setCodigo("LOG-EXPRESS-002");
            empresa2.setRuc("20234567890");
            empresa2.setDireccionLegal("Jr. Comercio 456, Arequipa");
            empresa2.setEmail("ventas@logisticaexpress.com");
            empresa2.setContactoTelefono("054-345678");
            empresa2.setEstadoOperativo("ACTIVO");
            empresa2.setInicioVigencia(LocalDate.now().minusYears(1));
            empresa2.setFinVigencia(LocalDate.now().plusYears(4));
            empresa2.setActivo(true);
            empresa2.setFechaRegistro(LocalDateTime.now());
            empresaRepository.save(empresa2);

            System.out.println("Empresas de prueba creadas");
        }

        if (gerenteRepository.count() == 0L) {
            Gerente gerente1 = new Gerente();
            gerente1.setNombre("Carlos Mendoza Silva");
            gerente1.setDni(34567890);
            gerente1.setTelefono("987654321");
            gerente1.setWhatsapp("987654321");
            gerente1.setPartidaElectronica("PE-123456");
            gerente1.setInicioVigenciaPodre(LocalDate.now().minusYears(2));
            gerente1.setFinVigenciaPodre(LocalDate.now().plusYears(3));
            gerente1.setActivo(true);
            gerente1.setFechaRegistro(LocalDateTime.now());
            gerenteRepository.save(gerente1);

            Gerente gerente2 = new Gerente();
            gerente2.setNombre("Ana García Flores");
            gerente2.setDni(45678901);
            gerente2.setTelefono("912345678");
            gerente2.setWhatsapp("912345678");
            gerente2.setPartidaElectronica("PE-234567");
            gerente2.setInicioVigenciaPodre(LocalDate.now().minusYears(1));
            gerente2.setFinVigenciaPodre(LocalDate.now().plusYears(4));
            gerente2.setActivo(true);
            gerente2.setFechaRegistro(LocalDateTime.now());
            gerenteRepository.save(gerente2);

            System.out.println("Gerentes de prueba creados");
        }

        // 4. Crear un Formato si no existe
        if (formatosRepository.count() == 0L) {
            Formatos formato = new Formatos();
            formato.setArchivoRuta("/formatos/solicitud.pdf");
            formato.setDescripcion("Formato de Solicitud");
            formato.setFechaCreacion(LocalDateTime.now());
            formatosRepository.save(formato);
            System.out.println("Formato creado");
        }

        // 5. Crear TUPACs desde backup
        if (tupacRepository.count() == 0L) {
            Optional<Formatos> formatoOpt = formatosRepository.findAll().stream().findFirst();
            Formatos formato = formatoOpt.orElse(null);
            
            // TUPAC 1: TUPA-LIC
            TUPAC tupac1 = new TUPAC();
            tupac1.setCategoria("Licencia");
            tupac1.setCodigo("TUPA-LIC");
            tupac1.setDescripcion("TUPA para Licencias de Conducir");
            tupac1.setEstado("vigente");
            tupac1.setFechaVigencia(null);
            tupacRepository.save(tupac1);
            
            // TUPAC 2: INSP (TUC)
            TUPAC tupac2 = new TUPAC();
            tupac2.setCategoria("TUC");
            tupac2.setCodigo("INSP");
            tupac2.setDescripcion("inspeccion vehicular");
            tupac2.setEstado("vigente");
            tupac2.setFechaVigencia(null);
            tupacRepository.save(tupac2);
            System.out.println("TUPACs creados (2 registros)");
        }

        // 6. Crear Requisitos TUPAC desde backup
        if (requisitoTUPACRepository.count() == 0L) {
            List<TUPAC> tupacs = tupacRepository.findAll();
            Optional<Formatos> formatoOpt = formatosRepository.findAll().stream().findFirst();
            Formatos formato = formatoOpt.orElse(null);
            
            // Mapa para guardar IDs de requisitos por código
            Map<String, Long> reqIds = new HashMap<>();
            
            if (tupacs.size() >= 2) {
                TUPAC tupac1 = tupacs.get(0); // TUPA-LIC
                TUPAC tupac2 = tupacs.get(1); // INSP
                
                // Requisitos para TUPA-LIC (tupac=1)
                RequisitoTUPAC r1 = new RequisitoTUPAC();
                r1.setCodigo("EXAMEN_TEORICO BIIB");
                r1.setDescripcion("Examen de Conocimiento Teórico BIIB");
                r1.setTipoDocumento("examen_presencial");
                r1.setObligatorio(true);
                r1.setEsExamen(true);
                r1.setActivo(true);
                r1.setTupac(tupac1);
                requisitoTUPACRepository.save(r1);
                reqIds.put("EXAMEN_TEORICO BIIB", r1.getId());
                
                RequisitoTUPAC r2 = new RequisitoTUPAC();
                r2.setCodigo("EXAMEN_MANEJO BIIB");
                r2.setDescripcion("Examen de Manejo Práctico BIIB");
                r2.setTipoDocumento("examen_presencial");
                r2.setObligatorio(true);
                r2.setEsExamen(true);
                r2.setActivo(true);
                r2.setTupac(tupac1);
                requisitoTUPACRepository.save(r2);
                reqIds.put("EXAMEN_MANEJO BIIB", r2.getId());
                
                RequisitoTUPAC r3 = new RequisitoTUPAC();
                r3.setCodigo("EXAMEN_TEORICO BIIC");
                r3.setDescripcion("Examen de Conocimiento Teórico C");
                r3.setTipoDocumento("examen_presencial");
                r3.setObligatorio(true);
                r3.setEsExamen(true);
                r3.setActivo(true);
                r3.setTupac(tupac1);
                requisitoTUPACRepository.save(r3);
                reqIds.put("EXAMEN_TEORICO BIIC", r3.getId());
                
                RequisitoTUPAC r4 = new RequisitoTUPAC();
                r4.setCodigo("EXAMEN_MANEJO BIIC");
                r4.setDescripcion("Examen de Manejo Práctico C");
                r4.setTipoDocumento("examen_presencial");
                r4.setObligatorio(true);
                r4.setEsExamen(true);
                r4.setActivo(true);
                r4.setTupac(tupac1);
                requisitoTUPACRepository.save(r4);
                reqIds.put("EXAMEN_MANEJO BIIC", r4.getId());
                
                RequisitoTUPAC r5 = new RequisitoTUPAC();
                r5.setCodigo("DOC_DNI");
                r5.setDescripcion("Copia del DNI");
                r5.setTipoDocumento("archivo");
                r5.setObligatorio(true);
                r5.setEsExamen(false);
                r5.setActivo(true);
                r5.setTupac(tupac1);
                requisitoTUPACRepository.save(r5);
                reqIds.put("DOC_DNI", r5.getId());
                
                RequisitoTUPAC r6 = new RequisitoTUPAC();
                r6.setCodigo("DOC_LICENCIA_ANTERIOR");
                r6.setDescripcion("Licencia de conducir anterior");
                r6.setTipoDocumento("archivo");
                r6.setObligatorio(false);
                r6.setEsExamen(false);
                r6.setActivo(true);
                r6.setTupac(tupac1);
                requisitoTUPACRepository.save(r6);
                reqIds.put("DOC_LICENCIA_ANTERIOR", r6.getId());
                
                RequisitoTUPAC r7 = new RequisitoTUPAC();
                r7.setCodigo("FORMATO_SOLICITUD");
                r7.setDescripcion("Formulario de Solicitud");
                r7.setTipoDocumento("formato");
                r7.setObligatorio(true);
                r7.setEsExamen(false);
                r7.setActivo(true);
                r7.setTupac(tupac1);
                if (formato != null) {
                    r7.setFormato(formato);
                }
                requisitoTUPACRepository.save(r7);
                reqIds.put("FORMATO_SOLICITUD", r7.getId());
                
                RequisitoTUPAC r8 = new RequisitoTUPAC();
                r8.setCodigo("CERTIFICADO_MEDICO");
                r8.setDescripcion("Certificado Médico");
                r8.setTipoDocumento("archivo");
                r8.setObligatorio(true);
                r8.setEsExamen(false);
                r8.setActivo(true);
                r8.setTupac(tupac1);
                requisitoTUPACRepository.save(r8);
                reqIds.put("CERTIFICADO_MEDICO", r8.getId());
                
                RequisitoTUPAC r9 = new RequisitoTUPAC();
                r9.setCodigo("PAGO_TASA");
                r9.setDescripcion("Comprobante de Pago de Tasa");
                r9.setTipoDocumento("archivo");
                r9.setObligatorio(true);
                r9.setEsExamen(false);
                r9.setActivo(true);
                r9.setTupac(tupac1);
                requisitoTUPACRepository.save(r9);
                reqIds.put("PAGO_TASA", r9.getId());
                
                // Requisito para INSP (tupac=2)
                RequisitoTUPAC r10 = new RequisitoTUPAC();
                r10.setCodigo("TEST");
                r10.setDescripcion("test");
                r10.setTipoDocumento("Otro");
                r10.setObligatorio(false);
                r10.setEsExamen(false);
                r10.setActivo(true);
                r10.setTupac(tupac2);
                requisitoTUPACRepository.save(r10);
                reqIds.put("TEST", r10.getId());
                
                System.out.println("Requisitos TUPAC creados (10 registros)");
            }
        }

        // 7. Crear Tipos de Trámite desde backup
        if (tipoTramiteRepository.count() == 0L) {
            List<TUPAC> tupacs = tupacRepository.findAll();
            List<RequisitoTUPAC> requisitos = requisitoTUPACRepository.findAll();
            
            if (tupacs.size() >= 1) {
                TUPAC tupac1 = tupacs.get(0); // TUPA-LIC
                
                // Crear mapa de IDs de requisitos por código
                Map<String, Long> reqIdMap = new HashMap<>();
                for (RequisitoTUPAC req : requisitos) {
                    reqIdMap.put(req.getCodigo(), req.getId());
                }
                
                // Tipo 1: REV-C (Revalidación de Licencia C) - sin requisitos
                TipoTramite tipo1 = new TipoTramite();
                tipo1.setCodigo("REV-C");
                tipo1.setDescripcion("Revalidación de Licencia C");
                tipo1.setDiasDescargo(5);
                tipo1.setTupac(tupac1);
                tipo1.setRequisitosIds("[]");
                tipoTramiteRepository.save(tipo1);
                
                // Tipo 2: DUP-C (Duplicado de Licencia C) - sin requisitos
                TipoTramite tipo2 = new TipoTramite();
                tipo2.setCodigo("DUP-C");
                tipo2.setDescripcion("Duplicado de Licencia C");
                tipo2.setDiasDescargo(6);
                tipo2.setTupac(tupac1);
                tipo2.setRequisitosIds("[]");
                tipoTramiteRepository.save(tipo2);
                
                // Tipo 3: OBT-C (Obtención de Licencia C) - requisitos [3,4]
                List<Long> ids3 = new ArrayList<>();
                if (reqIdMap.containsKey("EXAMEN_TEORICO BIIC")) ids3.add(reqIdMap.get("EXAMEN_TEORICO BIIC"));
                if (reqIdMap.containsKey("EXAMEN_MANEJO BIIC")) ids3.add(reqIdMap.get("EXAMEN_MANEJO BIIC"));
                TipoTramite tipo3 = new TipoTramite();
                tipo3.setCodigo("OBT-C");
                tipo3.setDescripcion("Obtención de Licencia C");
                tipo3.setDiasDescargo(4);
                tipo3.setTupac(tupac1);
                tipo3.setRequisitosIds(ids3.toString());
                tipoTramiteRepository.save(tipo3);
                
                // Tipo 4: OBT (Obtención de Licencia) - requisitos [1,2,5,7,8,9]
                List<Long> ids4 = new ArrayList<>();
                if (reqIdMap.containsKey("EXAMEN_TEORICO BIIB")) ids4.add(reqIdMap.get("EXAMEN_TEORICO BIIB"));
                if (reqIdMap.containsKey("EXAMEN_MANEJO BIIB")) ids4.add(reqIdMap.get("EXAMEN_MANEJO BIIB"));
                if (reqIdMap.containsKey("DOC_DNI")) ids4.add(reqIdMap.get("DOC_DNI"));
                if (reqIdMap.containsKey("FORMATO_SOLICITUD")) ids4.add(reqIdMap.get("FORMATO_SOLICITUD"));
                if (reqIdMap.containsKey("CERTIFICADO_MEDICO")) ids4.add(reqIdMap.get("CERTIFICADO_MEDICO"));
                if (reqIdMap.containsKey("PAGO_TASA")) ids4.add(reqIdMap.get("PAGO_TASA"));
                TipoTramite tipo4 = new TipoTramite();
                tipo4.setCodigo("OBT");
                tipo4.setDescripcion("Obtención de Licencia");
                tipo4.setDiasDescargo(1);
                tipo4.setTupac(tupac1);
                tipo4.setRequisitosIds(ids4.toString());
                tipoTramiteRepository.save(tipo4);
                
                // Tipo 5: REN (Revalidación de Licencia) - requisitos [1,5,7,9]
                List<Long> ids5 = new ArrayList<>();
                if (reqIdMap.containsKey("EXAMEN_TEORICO BIIB")) ids5.add(reqIdMap.get("EXAMEN_TEORICO BIIB"));
                if (reqIdMap.containsKey("DOC_DNI")) ids5.add(reqIdMap.get("DOC_DNI"));
                if (reqIdMap.containsKey("FORMATO_SOLICITUD")) ids5.add(reqIdMap.get("FORMATO_SOLICITUD"));
                if (reqIdMap.containsKey("PAGO_TASA")) ids5.add(reqIdMap.get("PAGO_TASA"));
                TipoTramite tipo5 = new TipoTramite();
                tipo5.setCodigo("REN");
                tipo5.setDescripcion("Revalidación de Licencia");
                tipo5.setDiasDescargo(2);
                tipo5.setTupac(tupac1);
                tipo5.setRequisitosIds(ids5.toString());
                tipoTramiteRepository.save(tipo5);
                
                // Tipo 6: DUP (Duplicado de Licencia) - requisitos [5,9]
                List<Long> ids6 = new ArrayList<>();
                if (reqIdMap.containsKey("DOC_DNI")) ids6.add(reqIdMap.get("DOC_DNI"));
                if (reqIdMap.containsKey("PAGO_TASA")) ids6.add(reqIdMap.get("PAGO_TASA"));
                TipoTramite tipo6 = new TipoTramite();
                tipo6.setCodigo("DUP");
                tipo6.setDescripcion("Duplicado de Licencia");
                tipo6.setDiasDescargo(3);
                tipo6.setTupac(tupac1);
                tipo6.setRequisitosIds(ids6.toString());
                tipoTramiteRepository.save(tipo6);
                
                System.out.println("Tipos de Trámite creados (6 registros)");
            }
        }

        // Actualizar trámites existentes para corregir relaciones faltantes
        try {
            tramiteService.actualizarTramitesExistentes();
            System.out.println("Trámites existentes actualizados");
        } catch (Exception e) {
            System.out.println("Error actualizando trámites existentes: " + e.getMessage());
        }

        // Crear trámite de ejemplo si no hay ninguno
        if (tramiteRepository.count() == 0) {
            Users user = usersRepository.findByUsername("admin");
            if (user == null) user = usersRepository.findByUsername("superadmin");
            if (user != null && user.getDepartamento() != null && !tipoTramiteRepository.findAll().isEmpty()) {
                Tramite tramite = new Tramite();
                tramite.setCodigoRut("EXAMPLE-001");
                tramite.setEstado("REGISTRADO");
                tramite.setPrioridad("normal");
                tramite.setObservaciones("Trámite de ejemplo creado automáticamente");
                tramite.setUsuarioRegistra(user);
                tramite.setDepartamentoActual(user.getDepartamento());
                List<TipoTramite> tipos = tipoTramiteRepository.findAll();
                if (!tipos.isEmpty()) {
                    tramite.setTipoTramite(tipos.get(0));
                }
                tramite.setFechaRegistro(LocalDateTime.now());
                tramite.setTipoSolicitante("PersonaNatural");
                List<PersonaNatural> personas = personaNaturalRepository.findAll();
                if (!personas.isEmpty()) {
                    tramite.setPersonaNatural(personas.get(0));
                }
                tramiteRepository.save(tramite);
                System.out.println("Trámite ejemplo creado con código: " + tramite.getCodigoRut() + " para usuario " + user.getUsername());
            }
        }

        System.out.println("Data initialization completada (datos mínimos)");
    }

    private Roles createOrUpdateRole(String name, String description) {
        Optional<Roles> opt = rolesRepository.findByName(name);
        Roles role;
        if (opt.isPresent()) {
            role = opt.get();
        } else {
            role = new Roles();
            role.setName(name);
            role.setDescription(description);
            role.setHierarchyLevel(name.equals("SUPER_ADMIN") ? 0 : 1);
            role.setEnabled(true);
            role.setIsSystem(true);
            role.setCreatedAt(LocalDateTime.now());
        }
        role.setCanViewAllData(true);
        role.setCanManageAllData(true);
        role.setCanEditOwnData(true);
        role.setCanCreateData(true);
        role.setCanDeleteData(true);
        role.setCanManageUsers(name.equals("SUPER_ADMIN"));
        role.setTablePermissions(buildTablePermissions(name));
        rolesRepository.save(role);
        System.out.println("Rol " + name + " creado/actualizado");
        return role;
    }

    private Map<String, Object> buildTablePermissions(String roleName) {
        Map<String, Object> tablePerms = new HashMap<>();
        String[] tablas = {
            // Underscore tables
            "tupac", "requisito_tupac", "formato", "tipo_tramite", "users", "roles", "departamento", "documento_tramite",
            "categorias_transporte", "categoria_transporte", "grupo_presentacion", "examen", "inspeccion", "notificacion",
            "expediente", "solicitud", "publicacion", "observacion_solicitud", "historial_tramite", "tramite",
            "tipo_transporte", "subtipo_transporte",
            // Hyphenated tables (as used in endpoints)
            "categorias-transporte", "categoria-transporte", "tipos-transporte", "tipo-transporte", "subtipos-transporte", "subtipo-transporte"
        };
        for (String tabla : tablas) {
            Map<String, Boolean> p = new HashMap<>();
            boolean canManageUsers = roleName.equals("SUPER_ADMIN");
            if (tabla.equals("users") || tabla.equals("roles")) {
                p.put("canView", true);
                p.put("canEdit", canManageUsers);
                p.put("canCreate", canManageUsers);
                p.put("canDelete", canManageUsers);
            } else {
                p.put("canView", true);
                p.put("canEdit", true);
                p.put("canCreate", true);
                p.put("canDelete", true);
            }
            tablePerms.put(tabla, p);
        }
        return tablePerms;
    }
}
