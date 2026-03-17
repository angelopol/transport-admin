# Funcionalidades Implementadas - Transport Admin

Este documento detalla todas las capacidades técnicas y funcionales integradas en el ecosistema de **Transport Admin** hasta la fecha.

## 1. Gestión de Flota y Personal (Core CRUDs)
- **Unidades (Buses):** Registro detallado de placas, asignación de rutas, conductores y colectores. Vinculación directa con dispositivos físicos.
- **Rutas:** Definición de trayectos activos, con soporte para múltiples esquemas de tarifas (General y Domingo/Feriados).
- **Conductores:** Gestión de perfiles con carga de fotografía (para exclusión de conteo facial) y vinculación con cuentas de usuario.
- **Colectores:** Registro de personal de apoyo para la gestión de ingresos manuales.
- **Usuarios:** Sistema de administración de cuentas con roles jerárquicos.

## 2. Integración de Hardware e IoT
- **Sincronización de Telemetría:** API robusta para recibir eventos de conteo de pasajeros y ubicación GPS desde dispositivos embebidos.
- **Conteo Facial (Face Counting):** 
    - Soporte para detección local (MediaPipe) y remota (AWS Rekognition).
    - Filtros de calidad (nitidez y tamaño) para optimizar el reconocimiento.
    - Persistencia de estados para evitar conteos duplicados ante reinicios.
- **Exclusión de Rostros:** Sistema automático para que el hardware ignore los rostros de conductores registrados al contar pasajeros.
- **Heartbeat & Status:** Monitoreo en tiempo real del estado de conexión de los dispositivos.

## 3. Gestión de Ingresos (Recaudación)
- **Módulo de Pasaje (Manual Entries):** Interfaz simplificada para operativos (conductores/colectores) para registrar ingresos físicos y digitales.
- **Validación Digital (Gemini AI):** Integración con IA para extraer automáticamente números de referencia desde capturas de pantalla de pagos móviles/transferencias.
- **Captura de Evidencia:** Integración nativa con cámara web/móvil para fotos obligatorias de comprobantes de pago.
- **Cartel de Pagos (Payment Poster):** Generador de carteles imprimibles con QR y datos bancarios (Pago Móvil/Transferencia) personalizados por unidad.

## 4. Reportes y Analítica
- **Reporte General (Financiero):** 
    - Visualización de ingresos totales y pasajeros.
    - Comparativa contra periodos anteriores con indicadores de crecimiento (KPIs).
    - Desglose por tipo de pasajero y método de pago.
- **Calendario de Ingresos:** Vista mensual dinámica que permite ver la recaudación día por día y acceder a reportes detallados con un clic.
- **Reportes Avanzados:**
    - **Espaciado de Unidades:** Cálculo en tiempo real de la distancia (metros) y tiempo (minutos) entre buses de una misma ruta.
    - **Pasajeros por Zona:** Mapa de calor interactivo que permite seleccionar un área geográfica para analizar abordajes.
    - **Tiempos de Ruta:** Estadísticas sobre la duración promedio de las vueltas completas por ruta.

## 5. Monitoreo y Mapas
- **Seguimiento en Vivo:** Mapa con la ubicación actual de todas las unidades activas y auto-refresco.
- **Histórico de Recorridos:** Reproducción de rutas realizadas en fechas específicas, mostrando el rastro GPS y los puntos exactos de abordaje de pasajeros.

## 6. Seguridad y Experiencia de Usuario (UX)
- **Control de Acceso Basado en Roles (RBAC):**
    - **Admin:** Control total de usuarios, dispositivos y configuración global.
    - **Owner (Dueño):** Gestión de su propia flota, personal y acceso a todos los reportes avanzados.
    - **Operative (Conductor/Colector):** Acceso restringido exclusivamente al módulo de registro de pasajes.
- **Optimización Móvil:** Diseño responsivo con botones flotantes (FAB), tablas con scroll horizontal y menús adaptados.
- **Localización Completa:** Sistema traducido íntegramente al español (Validaciones, Auth, Atributos).
- **Validaciones Nacionales:** Validaciones específicas para números de teléfono venezolanos y formatos de Cédula/RIF.
- **Sincronización Horaria:** Manejo preciso de husos horarios (`America/Caracas`) para asegurar que los reportes coincidan con la operación real de la flota.
