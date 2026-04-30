# 🏗️ Arquitectura Visual: Transport Admin (Diagramas Mermaid)

Esta documentación centraliza los planos técnicos del ecosistema **Transport Admin**. Los diagramas están construidos utilizando la sintaxis **Mermaid**, permitiendo una representación clara de la lógica de clases, flujos de datos y arquitectura de red.

> [!TIP]
> **¿Cómo utilizar estos diagramas?**
> 1. Copia el bloque de código `mermaid`.
> 2. En **Draw.io**, ve a `Arrange > Insert > Advanced > Mermaid`.
> 3. Pega el código para generar el diagrama editable automáticamente.

---

## 📂 Índice de Diagramas
1. [Diagrama de Clases UML](#1-diagrama-de-clases-uml-completo)
2. [Modelo Entidad-Relación (DER)](#2-modelo-entidad-relación---der)
3. [Arquitectura y Flujo de Módulos](#3-arquitectura-y-flujo-de-módulos)
4. [Jerarquía y Roles (RBAC)](#4-jerarquía-y-roles)
5. [Casos de Uso por Actor](#5-casos-de-uso-por-actor)
6. [Secuencia: Recaudación con IA](#6-diagrama-de-secuencia-recaudación-inteligente-con-ia)
7. [Máquina de Estados: IoT y Privacidad](#7-máquina-de-estados-hardware-y-privacidad)
8. [Arquitectura de Red y Despliegue](#8-diagrama-de-despliegue--red)
9. [Integración Visión CV - Gestión](#9-arquitectura-de-integración-visión-por-computador---gestión)
10. [Flujo de Reportes BI](#10-flujo-de-generación-de-reportes-bi)
11. [Dashboard Inteligente](#11-arquitectura-del-dashboard-inteligente-de-e-commerce)

---

## 1. Diagrama de Clases UML Completo
**Propósito:** Ilustrar la estructura fundamental de objetos, herencia y relaciones del backend Laravel.

```mermaid
classDiagram
    %% Usuarios y Roles Principales
    class Usuario {
        +int id
        +string nombre
        +string correo
        +enum rol (admin, dueno, operativo)
        +bool esAdmin()
        +bool esDueno()
        +bool esOperativo()
    }
    class Conductor {
        +int id
        +string nombre
        +string cedula
        +string telefono
        +string ruta_foto
        +int id_dueno
        +int id_usuario
    }
    class Colector {
        +int id
        +string nombre
        +string cedula
        +string telefono
        +int id_dueno
        +int id_usuario
    }

    %% Flota Principal
    class Ruta {
        +int id
        +string nombre
        +decimal tarifa_general
        +decimal tarifa_domingo
        +int id_dueno
    }
    class Autobus {
        +int id
        +string placa
        +int capacidad
        +int id_dueno
        +int id_ruta
        +int id_dispositivo
        +int id_cuenta_transferencia
        +int id_cuenta_pago_movil
    }
    class Dispositivo {
        +int id
        +string direccion_mac
        +string token_api
        +int id_dueno
        +datetime ultima_conexion
    }

    %% Entidades de Gestión
    class CuentaBancaria {
        +int id
        +string nombre_banco
        +string numero_cuenta
        +string nombre_titular
        +string rif_titular
        +string telefono
        +enum tipo (transferencia, pago_movil)
    }
    
    %% Registros Operativos
    class EventoTelemetrico {
        +int id
        +int cantidad_pasajeros
        +float latitud
        +float longitud
        +datetime marca_tiempo_evento
    }
    class IngresoManual {
        +int id
        +decimal monto
        +string metodo_pago
        +string numero_referencia
        +string ruta_foto_comprobante
        +datetime fecha
    }

    %% Nuevas Características (Analítica y Auditoría)
    class BitacoraAuditoria {
        +int id
        +string accion
        +string detalles_inalterables
        +datetime fecha_creacion
    }
    class AlertaSistema {
        +int id
        +string tipo_alerta
        +string mensaje
        +bool esta_leida
    }
    class ServicioReportesBI {
        +calcularTasaEvasion()
        +obtenerEspaciadoUnidades()
        +obtenerMapaCalorPasajeros()
        +obtenerTiemposRuta()
        +exportarAPDF()
    }

    %% Relaciones
    Usuario "1" --> "*" Conductor : vinculado a
    Usuario "1" --> "*" Colector : vinculado a
    Usuario "1" --> "*" Ruta : posee
    Usuario "1" --> "*" Autobus : posee
    Usuario "1" --> "*" Dispositivo : posee
    Usuario "1" --> "*" CuentaBancaria : posee
    Usuario "1" --> "*" BitacoraAuditoria : registra acciones
    Usuario "1" --> "*" AlertaSistema : recibe
    
    Autobus "*" --> "1" Ruta : pertenece a
    Autobus "1" --> "1" Dispositivo : emparejado con
    Autobus "*" --> "*" Conductor : asignado a
    Autobus "*" --> "*" Colector : asignado a
    Autobus --> CuentaBancaria : pagos vinculados
    
    Autobus "1" --> "*" EventoTelemetrico : genera
    Autobus "1" --> "*" IngresoManual : registra
    
    ServicioReportesBI ..> EventoTelemetrico : cruza datos
    ServicioReportesBI ..> IngresoManual : cruza datos
```

---

## 2. Modelo Entidad-Relación - DER
**Propósito:** Definir el esquema físico de la base de datos MySQL y la trazabilidad relacional.

```mermaid
erDiagram
    USUARIOS ||--o{ CONDUCTORES : "tiene_perfil"
    USUARIOS ||--o{ COLECTORES : "tiene_perfil"
    USUARIOS ||--o{ RUTAS : "posee"
    USUARIOS ||--o{ AUTOBUSES : "posee"
    USUARIOS ||--o{ DISPOSITIVOS : "posee"
    USUARIOS ||--o{ CUENTAS_BANCARIAS : "posee"
    USUARIOS ||--o{ BITACORAS_AUDITORIA : "genera"
    USUARIOS ||--o{ ALERTAS_SISTEMA : "recibe"
    
    RUTAS ||--o{ AUTOBUSES : "asignado_a"
    DISPOSITIVOS |o--o| AUTOBUSES : "instalado_en"
    
    AUTOBUSES ||--o{ AUTOBUS_CONDUCTOR : "pivote"
    CONDUCTORES ||--o{ AUTOBUS_CONDUCTOR : "pivote"
    
    AUTOBUSES ||--o{ AUTOBUS_COLECTOR : "pivote"
    COLECTORES ||--o{ AUTOBUS_COLECTOR : "pivote"
    
    CUENTAS_BANCARIAS ||--o{ AUTOBUSES : "cta_transferencia"
    CUENTAS_BANCARIAS ||--o{ AUTOBUSES : "cta_pago_movil"

    AUTOBUSES ||--o{ EVENTOS_TELEMETRICOS : "captura_sin_imagenes"
    AUTOBUSES ||--o{ INGRESOS_MANUALES : "recibe_pago"
    USUARIOS ||--o{ INGRESOS_MANUALES : "registrado_por"

    EVENTOS_TELEMETRICOS {
        int id PK
        int id_autobus FK
        int cantidad_pasajeros "Solo Metadata (Privacidad)"
        float latitud
        float longitud
        datetime marca_tiempo
    }
    
    INGRESOS_MANUALES {
        int id PK
        int id_autobus FK
        int id_usuario FK
        decimal monto
        string metodo_pago
        string numero_referencia
        string ruta_foto
        datetime fecha
    }
    
    BITACORAS_AUDITORIA {
        int id PK
        int id_usuario FK
        string accion
        string detalles "Registro Inalterable"
        datetime fecha_creacion
    }
```

---

## 3. Arquitectura y Flujo de Módulos
**Propósito:** Visión macro del viaje de los datos desde el sensor IoT hasta la PWA del usuario.

```mermaid
flowchart TD
    %% CAPA DE HARDWARE
    subgraph Capa_IoT ["Hardware / Computación en el Borde (Autobús)"]
        Camara[Cámara Local] --> Monitor[Python: Monitor de Transporte]
        Monitor --> MediaPipe[MediaPipe: Conteo Local]
        Monitor --> DBLocal[(SQLite Local: Sincronización Fuera de Línea)]
        FotosOperativos[Fotos de Choferes] --> MediaPipe
        MediaPipe --> |"Descartar rostro (Operativo)"| Sync[Python: Cliente de Sincronización]
        MediaPipe --> |"Descartar imágenes completas"| Sync
        Sync -.-> |Autenticación: Token Dispositivo| API_Gateway
    end

    %% CAPA BACKEND
    subgraph Capa_Backend ["Servidor Central (Laravel 11)"]
        API_Gateway[API / Middleware Sanctum]
        
        subgraph Servicios
            ControladorTelemetria[Controlador Telemetría]
            ControladorIngresos[Controlador Ingresos & Gemini]
            ControladorReportes[Controlador Reportes BI & Evasión]
            ServicioAuditoria[Servicio Auditoría & Alertas]
        end
        
        DBCentral[(Base de Datos MySQL)]
        
        API_Gateway --> ControladorTelemetria
        API_Gateway --> ControladorIngresos
        API_Gateway --> ControladorReportes
        API_Gateway --> ServicioAuditoria
        
        ControladorTelemetria --> DBCentral
        ControladorIngresos --> DBCentral
        ControladorReportes --> DBCentral
        ServicioAuditoria --> DBCentral
    end

    %% SERVICIOS EXTERNOS
    subgraph Servicios_Externos ["Servicios en la Nube"]
        Gemini[Google Gemini AI API]
        AWS[AWS Rekognition Opcional]
    end

    %% CAPA FRONTEND
    subgraph Capa_Frontend ["PWA / Aplicación (React + Inertia)"]
        PWA[Manifest.json - PWA Instalable]
        
        subgraph Interfaces
            UIDueno[Portal Dueño: BI, PDF, Mapas]
            UIOperativo[App Choferes: Registro de Pagos]
            UIAdmin[Portal Admin: CRUD Global]
        end
    end

    %% CONEXIONES
    ControladorIngresos <--> |"Extraer Ref. de Capturas (OCR)"| Gemini
    Monitor -.-> |"Conteo Auxiliar"| AWS
    
    UIDueno <--> |Peticiones| API_Gateway
    UIOperativo <--> |Peticiones| API_Gateway
    UIAdmin <--> |Peticiones| API_Gateway
    
    PWA -.-> Interfaces

    %% ESTILOS
    style Camara fill:#f9f2f4,stroke:#c7254e,stroke-width:2px,color:#c7254e
    style Monitor fill:#f9f2f4,stroke:#c7254e,stroke-width:2px,color:#c7254e
    style MediaPipe fill:#f9f2f4,stroke:#c7254e,stroke-width:2px,color:#c7254e
    style DBLocal fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style FotosOperativos fill:#f9f2f4,stroke:#c7254e,stroke-width:2px,color:#c7254e
    style Sync fill:#f9f2f4,stroke:#c7254e,stroke-width:2px,color:#c7254e

    style API_Gateway fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#004d40
    style ControladorTelemetria fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#004d40
    style ControladorIngresos fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#004d40
    style ControladorReportes fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#004d40
    style ServicioAuditoria fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#004d40
    style DBCentral fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20

    style Gemini fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    style AWS fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c

    style PWA fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    style UIDueno fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    style UIOperativo fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
    style UIAdmin fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
```

---

## 4. Jerarquía y Roles
**Propósito:** Definir los niveles de acceso y permisos (RBAC) del sistema.

```mermaid
graph TD
    Sistema[Plataforma Transport Admin]
    
    Admin[Administrador General]
    Dueno[Dueño de Autobuses / Transportista]
    Operativo[Personal Operativo]
    
    Conductor[Conductor]
    Colector[Colector / Avance]
    
    Sistema --- Admin
    Sistema --- Dueno
    Sistema --- Operativo
    
    Operativo --- Conductor
    Operativo --- Colector
    
    Admin -->|Crea y gestiona cuentas de| Dueno
    Admin -->|Registra terminales físicos| Dispositivos[Dispositivos IoT]
    
    Dueno -->|Gestiona| Flota[Flota: Unidades, Rutas]
    Dueno -->|Gestiona| Bancos[Cuentas Bancarias]
    Dueno -->|Contrata y vincula| Conductor
    Dueno -->|Contrata y vincula| Colector
    Dueno -->|Supervisa| Reportes[Reportes BI Analítico]
    
    Conductor -->|Registra ingresos al final de jornada| ModuloPWA[Módulo de Pasaje PWA]
    Colector -->|Registra ingresos en ruta| ModuloPWA
    
    Dispositivos -.->|Monitorea asignación en unidad| Flota

    %% ESTILOS
    style Sistema fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238
    style ModuloPWA fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238

    style Admin fill:#fbe9e7,stroke:#d84315,stroke-width:2px,color:#bf360c
    style Dueno fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style Operativo fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e
    style Conductor fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e
    style Colector fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e

    style Dispositivos fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00
    style Flota fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00
    style Bancos fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00
    style Reportes fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00
```

---

## 5. Casos de Uso por Actor
**Propósito:** Listar las acciones concretas permitidas para cada tipo de usuario.

```mermaid
flowchart LR
    %% Actores
    Admin([Administrador])
    Dueno([Dueño de Flota])
    Operativo([Operativo: Chofer/Colector])
    Dispositivo([Dispositivo IoT])
    Sistema([Procesos de Sistema])

    %% Casos de Uso Admin
    subgraph Casos_Uso_Admin ["Administración Global"]
        A_CU1(Crear/Editar Usuarios Dueños)
        A_CU2(Generar Tokens para Dispositivos)
    end
    Admin --> A_CU1
    Admin --> A_CU2

    %% Casos de Uso Dueño
    subgraph Casos_Uso_Dueno ["Gestión e Inteligencia de Negocios (BI)"]
        D_CU1(Gestionar Flota y Bancos)
        D_CU2(Auditar Rastreo Histórico GPS)
        D_CU3(Revisar Tasa de Evasión de Pasajes)
        D_CU4(Comparar Tiempos de Ruta y Pasajeros)
        D_CU5(Exportar Reportes Contables PDF/Excel)
    end
    Dueno --> D_CU1
    Dueno --> D_CU2
    Dueno --> D_CU3
    Dueno --> D_CU4
    Dueno --> D_CU5

    %% Casos de Uso Operativo
    subgraph Casos_Uso_Operativo ["Recaudación en Ruta PWA"]
        Op_CU1(Instalar App en el Teléfono - PWA)
        Op_CU2(Registrar Ingresos Físicos)
        Op_CU3(Subir Captura de Pago Móvil)
    end
    Operativo --> Op_CU1
    Operativo --> Op_CU2
    Operativo --> Op_CU3

    %% Casos de Uso Hardware
    subgraph Casos_Uso_HW ["Telemetría Confidencial y Segura"]
        H_CU1(Conteo Local de Personas)
        H_CU2(Excluir Rostros Registrados)
        H_CU3(Descartar Imagen Inmediatamente - Privacidad)
        H_CU4(Sincronizar Metadata via API)
    end
    Dispositivo --> H_CU1
    Dispositivo --> H_CU2
    Dispositivo --> H_CU3
    Dispositivo --> H_CU4

    %% Casos de Uso Sistema Analítico
    subgraph Casos_Uso_Sistema ["Mecanismos Automáticos"]
        S_CU1(Analizar Capturas de Pago con IA)
        S_CU2(Cruzar Conteo de Cámara con Recaudado)
        S_CU3(Emitir Alerta de Desconexión / Evasión Alta)
        S_CU4(Registrar Bitácora Inalterable de Cambios)
    end
    Sistema --> S_CU1
    Sistema --> S_CU2
    Sistema --> S_CU3
    Sistema --> S_CU4
    
    Op_CU3 -.-> S_CU1
    S_CU2 -.-> D_CU3

    %% ESTILOS
    style Admin fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#b71c1c
    style Dueno fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#0d47a1
    style Operativo fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    style Dispositivo fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#e65100
    style Sistema fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#e65100

    style A_CU1 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style A_CU2 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style D_CU1 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style D_CU2 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style D_CU3 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style D_CU4 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style D_CU5 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style Op_CU1 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style Op_CU2 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style Op_CU3 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style H_CU1 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style H_CU2 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style H_CU3 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style H_CU4 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style S_CU1 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style S_CU2 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style S_CU3 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
    style S_CU4 fill:#ffffff,stroke:#78909c,stroke-width:2px,rx:20,ry:20
```

---

## 6. Diagrama de Secuencia: Recaudación Inteligente con IA
**Propósito:** Trazar el ciclo de vida temporal del registro de pagos asistido por OCR.

```mermaid
sequenceDiagram
    actor Operativo as Personal Operativo (PWA)
    participant Aplicacion as Aplicación Web
    participant Servidor as API Laravel
    participant IA as API Gemini AI
    participant DB as Base de Datos Central
    actor Dueno as Dueño (Dashboard)

    Operative->>Aplicacion: Selecciona "Nuevo Ingreso Local"
    Operative->>Aplicacion: Sube Captura de Pantalla del Pago
    Aplicacion->>Servidor: POST /api/ocr/analyze (Imagen Base64)
    activate Servidor
    Servidor->>IA: analizar_imagen(instruccion, imagen)
    activate IA
    IA-->>Servidor: JSON {numero_referencia, banco, monto}
    deactivate IA
    Servidor-->>Aplicacion: Auto-rellena formulario con datos extraídos
    deactivate Servidor
    
    Operative->>Aplicacion: Confirma Datos y envía POST /manual-entries
    Aplicacion->>Servidor: Valida datos y roles
    activate Servidor
    Servidor->>DB: Guarda Ingreso y ruta de la imagen probatoria
    Servidor->>DB: Crea registro inalterable en BITACORAS_AUDITORIA
    Servidor-->>Aplicacion: 201 Creado (Pago Registrado)
    deactivate Servidor
    
    Aplicacion-->>Operative: Éxito visual (Confeti/Notificación)
    
    note over Servidor,Dueno: Proceso Asíncrono / Reporteo
    Dueno->>Servidor: GET /reports (Visualizar Ingresos)
    Servidor->>DB: Cruza IngresosManuales vs EventosTelemetricos
    Servidor-->>Dueno: Muestra Tasa de Evasión e Ingresos
```

---

## 7. Máquina de Estados: Hardware y Privacidad
**Propósito:** Modelar el comportamiento interno del script de monitoreo IoT.

```mermaid
stateDiagram-v2
    [*] --> EnEspera : Encendido del Autobús
    
    state EnEspera {
        [*] --> Esperando
        Esperando --> Latido_Corazon : 60s inactivo
        Latido_Corazon --> Esperando : Confirmación (ACK) recibida
    }
    
    EnEspera --> MovimientoDetectado : Sensor PIR / Cambio de Píxeles
    
    state MovimientoDetectado {
        [*] --> CapturandoCuadro
        CapturandoCuadro --> EvaluandoCalidad : Nitidez/Tamaño OK?
        EvaluandoCalidad --> Fallido : Borroso/Muy pequeño (Descartado)
        Fallido --> CapturandoCuadro
        EvaluandoCalidad --> DeteccionLocal : MediaPipe / AWS
        
        DeteccionLocal --> ConductorConocido : ¿Rostro coincide con Conductores?
        ConductorConocido --> Descartar : No Contar (Regla de Exclusión)
        
        DeteccionLocal --> Pasajero : Rostro Nuevo
        Pasajero --> IncrementarContador : +1 Pasajero
        
        IncrementarContador --> Descartar : Privacidad por Diseño (Eliminar Foto)
    }
    
    MovimientoDetectado --> EstadoSincronizacion : Evento Registrado
    
    state EstadoSincronizacion {
        [*] --> VerificarConexion
        VerificarConexion --> DBFueraLinea : Sin Internet (Guardado Local SQLite)
        DBFueraLinea --> VerificarConexion : Reintento tras X min
        
        VerificarConexion --> EnviarAlServidor : Conexión OK
        EnviarAlServidor --> Exito_API : HTTP 201
        Exito_API --> LimpiarLocal : Limpiar buffer temporal
    }
    
    EstadoSincronizacion --> EnEspera : Fin del ciclo
```

---

## 8. Diagrama de Despliegue / Red
**Propósito:** Visualizar la distribución física de componentes y topologías de red.

```mermaid
graph TD
    %% BORDE LOCAL (Autobús)
    subgraph Borde_Local ["Computación en el Borde (En cada Autobús)"]
        Computadora[Computadora de Procesamiento]
        Camara[Módulo de Cámara HD]
        RedLocal[Red Interna / WiFi Móvil 4G]
        
        Camara --> |Flujo de Video| Computadora
        Computadora <--> |Acceso a Internet| RedLocal
        
        subgraph Scripts_Procesamiento ["Scripts Python"]
            TM[Monitor de Transporte]
            CS[Cliente de Sincronización]
            Buffer[(Buffer SQLite)]
            
            TM <--> CS
            CS <--> Buffer
        end
        Computadora -.- Scripts_Procesamiento
    end

    %% INTERNET / NUBE
    subgraph Nube ["Nube / Infraestructura Central"]
        subgraph VPS ["Servidor Principal (VPS)"]
            Nginx[Servidor Web Nginx/Apache]
            Laravel[Backend Laravel PHP]
            MySQL[(Base de Datos MySQL)]
            Programador[Cron Jobs / Colas]
            
            Nginx <--> Laravel
            Laravel <--> MySQL
            Laravel <--> Programador
        end
        
        IA_Gemini((API Gemini AI))
        IA_Aws((API AWS Rekognition))
    end
    
    %% CLIENTES
    subgraph Clientes ["Dispositivos Clientes (PWA)"]
        Celular_Op[Teléfono Celular Operativo]
        Navegador_Dueno[Navegador Dueño/Admin]
    end

    %% CONEXIONES
    RedLocal == "JSON + TokenDispositivo (HTTPS)" ==> Nginx
    
    Celular_Op == "HTTPS / React" ==> Nginx
    Navegador_Dueno == "HTTPS / React" ==> Nginx
    
    Laravel -.-> |"OCR de capturas"| IA_Gemini
    TM -.-> |"Fallo local -> AWS Alternativo"| IA_Aws

    %% ESTILOS
    style Computadora fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a237e
    style Camara fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a237e
    style TM fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a237e
    style CS fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a237e
    
    style RedLocal fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style Nginx fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style Laravel fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style Programador fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style IA_Gemini fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style IA_Aws fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    style Celular_Op fill:#e0f2f1,stroke:#00897b,stroke-width:2px,color:#004d40
    style Navegador_Dueno fill:#e0f2f1,stroke:#00897b,stroke-width:2px,color:#004d40
    
    style Buffer fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f
    style MySQL fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f
```

---

## 9. Arquitectura de Integración Visión por Computador - Gestión
**Propósito:** Detallar el "puente" tecnológico entre la detección Edge y el Backoffice.

```mermaid
graph TD
    %% MÓDULO VISIÓN POR COMPUTADOR (EDGE)
    subgraph Modulo_CV ["Módulo de Visión por Computador (En Vehículo)"]
        direction TB
        Camara[Sensor Óptico HD] --> |Flujo de Video (Cuadros)| Detector[Motor de Detección (MediaPipe)]
        
        subgraph Logica_CV ["Procesamiento Visión por Computador"]
            Detector --> |Cajas Delimitadoras| Rastreador[Algoritmo de Rastreo (Centroides)]
            Rastreador --> FiltroCalidad{Filtro de Calidad}
            FiltroCalidad -->|Aprobado| Exclusor[Filtro de Exclusión de Personal]
            FiltroCalidad -->|Reprobado| Descarte1(Descarte)
        end
        
        Exclusor --> |Rostro Nuevo| Contador[Contador de Pasajeros]
        Exclusor --> |Chofer Reconocido| Descarte2(Descarte Visual)
        
        Contador --> CargaUtil[Generador de JSON]
        CargaUtil --> |Datos limpios: ID, GPS, Tiempo| API_Sincronizacion[Cliente REST Python]
    end

    %% CANAL DE INTEGRACIÓN
    subgraph Canal_Integracion ["Canal de Sincronización Segura"]
        API_Sincronizacion <--> |HTTPS / Token Cifrado| Sanctum[Puerta de Enlace Laravel Sanctum]
    end

    %% PLATAFORMA DE GESTIÓN ADMINISTRATIVA (NUBE)
    subgraph Plataforma_Admin ["Plataforma de Gestión Administrativa (Transport Admin)"]
        direction TB
        Sanctum --> IngestorEventos[Ingestor de Eventos]
        IngestorEventos --> DBCentral[(Base de Datos Unificada)]
        
        subgraph Logica_Negocios ["Lógica de Negocios y Finanzas"]
            DBCentral --> Conciliador[Motor de Conciliación de Pagos]
            IngresoManual[Ingresos Manuales/Digitales] --> Conciliador
            Conciliador --> Motor_BI[Motor de Inteligencia de Negocios]
        end
        
        Motor_BI --> PanelControl[Panel de Control React PWA]
        Motor_BI --> GeneradorReportes[Generador de Reportes]
        
        subgraph Salidas_Admin ["Salidas al Usuario"]
            PanelControl --> Vistas[Vistas Comparativas y Kpis]
            GeneradorReportes --> PDF_Excel(Archivos PDF/CSV)
            Vistas --> Alertas(Alertas de Evasión)
        end
    end

    %% DEPENDENCIAS CRUZADAS
    DBCentral -.-> |Descarga periódica rostros permitidos| Exclusor

    %% ESTILOS
    style Camara fill:#424242,stroke:#000000,stroke-width:2px,color:#ffffff
    
    style Detector fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style Rastreador fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style FiltroCalidad fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style Exclusor fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style Contador fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style CargaUtil fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1

    style API_Sincronizacion fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100

    style Sanctum fill:#fbe9e7,stroke:#ff5722,stroke-width:2px,color:#bf360c
    style IngestorEventos fill:#fbe9e7,stroke:#ff5722,stroke-width:2px,color:#bf360c
    style Conciliador fill:#fbe9e7,stroke:#ff5722,stroke-width:2px,color:#bf360c
    style IngresoManual fill:#fbe9e7,stroke:#ff5722,stroke-width:2px,color:#bf360c
    style Motor_BI fill:#fbe9e7,stroke:#ff5722,stroke-width:2px,color:#bf360c

    style DBCentral fill:#ede7f6,stroke:#673ab7,stroke-width:2px,color:#311b92

    style PanelControl fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20
    style GeneradorReportes fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20
    style Vistas fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20
    style PDF_Excel fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20
    style Alertas fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20
```

---

## 10. Flujo de Generación de Reportes BI
**Propósito:** Describir la procedencia y procesamiento de los datos que consume el Dueño.

```mermaid
graph TD
    %% FUENTES DE DATOS (ORIGEN)
    subgraph Origen ["1. Fuentes Originales de Verdad"]
        HardwareEdge["Computadora de Procesamiento (Autobús)"] -->|"Módulo Local: Conteo de Pasajeros y GPS"| Telemetria[("Tabla: Eventos Telemétricos")]
        AppOperativo["PWA Operativos: Conductores y Colectores"] -->|"Módulo Pasaje: Transacciones y Fotos OCR"| Ingresos[("Tabla: Ingresos Manuales")]
    end

    %% BASE DE DATOS Y MOTOR BI
    subgraph Backoffice ["2. Motor de Inteligencia de Negocios (Laravel)"]
        Telemetria --> MotorBI{"Motor de Procesamiento BI"}
        Ingresos --> MotorBI
        
        MotorBI --> AgrupadorEvasion["1. Cruce: Conteo Físico vs Montos"]
        MotorBI --> AgrupadorTiempos["2. Lógica: Puntos cardinales de inicio/fin de trayecto"]
        MotorBI --> AgrupadorGeo["3. Lógica: Agrupación GPS por densidades / polígonos"]
        MotorBI --> AgrupadorDistancia["4. Lógica: Geolocalización comparativa entre múltiples autobuses"]
    end

    %% MÓDULOS DE REPORTES (CARA AL DUEÑO)
    subgraph Vistas_Dueno ["3. Interfaz del Dueño (Reportes Generados)"]
        AgrupadorEvasion --> RepGeneral["Reporte General y Financiero<br>Métricas: % Tasa de Evasión, Recaudado Bruto vs Real"]
        AgrupadorTiempos --> RepTiempos["Reporte: Tiempos de Ruta<br>Métricas: Duración Promedio de Ciclos (Minutos/Horas)"]
        AgrupadorGeo --> RepMapa["Reporte: Pasajeros por Área<br>Visualización: Mapa de Calor Leaflet"]
        AgrupadorDistancia --> RepEspaciado["Reporte: Espaciado de Unidades<br>Métricas: Distancia (km) y Tiempo (min) entre unidades de rescate"]
    end

    %% EXPORTACIÓN
    subgraph Exportacion ["4. Salidas y Contabilidad Físicas"]
        RepGeneral --> ArchivoPDF["Exportación a Reportes PDF Oficiales"]
        RepGeneral --> ArchivoCSV["Exportación a Hojas de Cálculo CSV/Excel"]
    end

    %% CONEXIONES A DUEÑO
    Consumidor(["Usuario Dueño / Administrador"]) -.-> |"Consulta Dashboards"| Vistas_Dueno
    
    %% ESTILOS
    style HardwareEdge fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    style AppOperativo fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    
    style Telemetria fill:#ede7f6,stroke:#673ab7,stroke-width:2px,color:#311b92
    style Ingresos fill:#ede7f6,stroke:#673ab7,stroke-width:2px,color:#311b92

    style MotorBI fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style AgrupadorEvasion fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style AgrupadorTiempos fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style AgrupadorGeo fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    style AgrupadorDistancia fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100

    style RepGeneral fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style RepTiempos fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style RepMapa fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    style RepEspaciado fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1

    style ArchivoPDF fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    style ArchivoCSV fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    style Consumidor fill:#fbe9e7,stroke:#ff5722,stroke-width:3px,color:#bf360c
```

---

## 11. Arquitectura del Dashboard Inteligente de E-commerce
**Propósito:** Diagrama de componentes basado en el modelo de De Crescenzo y Guerrero (2025).

```mermaid
flowchart TD
    %% Capa de Presentación
    subgraph CapaPresentacion ["Capa de Presentación"]
        direction TB
        Interfaz[Interfaz del Dashboard]
        Visualizacion[Componentes de Visualización Gráfica]
    end

    %% Capa de Lógica de Negocio
    subgraph CapaLogica ["Capa de Lógica de Negocio"]
        direction TB
        Preprocesamiento[Módulo de Preprocesamiento]
        KPIs[Cálculo de Indicadores Clave - KPIs]
        Conversion[Motor de Conversión y Normalización]
        Prediccion[Módulo de Análisis Predictivo]
    end

    %% Capa de Datos
    subgraph CapaDatos ["Capa de Datos"]
        direction TB
        API[Interfaz de Programación - API]
        Storage[(Almacenamiento de Datos)]
    end

    %% Relaciones de Flujo
    API --> Preprocesamiento
    Storage <--> API
    Preprocesamiento --> KPIs
    KPIs --> Conversion
    Conversion --> Prediccion
    Prediccion --> Visualizacion
    Visualizacion --> Interfaz

    %% Estilización
    style CapaPresentacion fill:#f5f5f5,stroke:#333,stroke-width:2px
    style CapaLogica fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style CapaDatos fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    style Interfaz fill:#fff,stroke:#333,stroke-width:2px
    style Visualizacion fill:#fff,stroke:#333,stroke-width:2px
    style Preprocesamiento fill:#fff,stroke:#01579b,stroke-width:1px
    style KPIs fill:#fff,stroke:#01579b,stroke-width:1px
    style Conversion fill:#fff,stroke:#01579b,stroke-width:1px
    style Prediccion fill:#fff,stroke:#01579b,stroke-width:1px
    style API fill:#fff,stroke:#e65100,stroke-width:1px
    style Storage fill:#fff,stroke:#e65100,stroke-width:1px
```

---

**Fuente:** Documentación Técnica de Transport Admin (2026).
