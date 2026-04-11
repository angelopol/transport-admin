# Funcionalidades Implementadas - Transport Admin

Este documento detalla todas las capacidades técnicas y funcionales integradas en el ecosistema de **Transport Admin** hasta la fecha.

## 1. Gestión de Flota, Rutas y Personal (Core CRUDs)
- **Unidades (Buses):** Registro detallado de placas, asignación de rutas, conductores y colectores. Vinculación directa con dispositivos físicos.
- **Rutas (Módulo Avanzado):** 
    - Definición de trayectos activos, con soporte para múltiples esquemas de tarifas.
    - **Tarifario Dual:** Soporte automatizado para diferenciar Rutas Suburbanas (viajes con tarifa urbana corta y tarifa larga simultáneamente).
    - **Ajustes y Actualización Masiva:** Posibilidad de fijar precios por defecto y panel de "Actualización Masiva" en un clic para homogeneizar los precios al subir la gaceta oficial sin alterar porcentajes de descuento.
    - **Gaceta Oficial:** Carga y alojamiento visual de la Gaceta Oficial escaneada por cada ruta para respaldar tabuladores.
- **Conductores:** Gestión de perfiles con carga de fotografía (para exclusión de conteo facial) y vinculación con cuentas de usuario.
- **Colectores:** Registro de personal de apoyo para la gestión de ingresos manuales.
- **Usuarios y Cuentas Bancarias:** 
    - Sistema de administración de cuentas de acceso con roles jerárquicos.
    - **Cuentas Bancarias:** Directorio para asignar instrumentos financieros de pago a la estructura de la empresa operadora para generar carteles.

## 2. Integración de Hardware e IoT
- **Administración de Hardware (Devices):** Control panel de nivel SuperAdministrador para registrar cajas físicas (MAC address, tokens, etc.), asignar flotas y monitoreo global.
- **Sincronización de Telemetría:** API robusta para recibir eventos de conteo de pasajeros y ubicación GPS desde dispositivos embebidos.
- **Conteo Facial (Face Counting):** 
    - Soporte para detección local (MediaPipe) y remota (AWS Rekognition).
    - Filtros de calidad (nitidez y tamaño) para optimizar el reconocimiento.
    - Persistencia de estados para evitar conteos duplicados ante reinicios.
- **Exclusión de Rostros:** Sistema automático para que el hardware ignore los rostros de conductores registrados al contar pasajeros basado en biometría.
- **Heartbeat & Status:** Monitoreo en tiempo real del estado de conexión y salud de la flota de dispositivos.

## 3. Gestión de Ingresos (Recaudación y Cobranza)
- **Módulo Abordo (Manual Entries):** Interfaz PWA simplificada para uso de operativos que facilita registrar ingresos físicos y digitales. Incorpora validación automatizada de trayecto (Corto/Largo) si la ruta es Suburbana y cálculos on-the-fly de descuentos.
- **Deducciones Dinámicas:** Aplicación porcentual o plana de deducciones al precio para perfiles como Estudiantes, Tercera Edad y Discapacitados.
- **Validación Digital (Gemini AI OCR):** Integración innovadora con Inteligencia Artificial capaz de leer y extraer automáticamente números de referencia capturados en pantallas de comprobantes móviles.
- **Cámara TPV:** Integración nativa del navegador con la cámara local/trasera del móvil para tomar fotos de recibos en las unidades.
- **Generador de Pago Móvil (Payment Poster):** Elaboración y exportación de un formato A4 estandarizado con el QR y datos configurados del banco, listo para ser pegado en la ventana del autobús.

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
    - **Admin:** Control total de infraestructura, usuarios, auditoría y hardware IoT.
    - **Owner (Dueño):** Gestión autónoma de su propia flota, personal, paramétricas de empresa y tableros estadísticos (Multitentant virtual).
    - **Operative (Conductor/Colector):** Acceso ultra restringido enfocado enteramente en el flujo de cobranza.
- **Auditoría Global (Audit Logs):** Tracker de sistema en segundo plano que conserva una constancia inviolable sobre creaciones, manipulaciones o bloqueos para proteger las transacciones de transportistas desleales.
- **Optimización Web App (PWA):** UI altamente receptiva modelada nativamente con TailwincCSS, interacciones asíncronas, botones flotantes de atajos (FAB) y un renderizado optimizado por InertiaJS.
- **Localización Completa:** Traducción de core services y base idiomática de validaciones al español latino (Timezones, Notificaciones y Logs).