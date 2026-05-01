# ⚙️ Funcionalidades Implementadas: Transport Admin

Este documento detalla el arsenal tecnológico y operativo integrado en la plataforma **Transport Admin**.

---

## 🏗️ 1. Núcleo de Gestión (Core CRUDs)

*   **🚌 Unidades (Buses):** Registro de placas y vinculación física con dispositivos IoT.
*   **🗺️ Rutas Avanzadas:** 
    *   Soporte para **Tarifario Dual** (Urbano/Suburbano).
    *   Gestión de Gacetas Oficiales digitales.
    *   Panel de **Actualización Masiva** de precios.
*   **👥 Gestión de Personal:** Perfiles para conductores (con biometría) y colectores.
*   **🏦 Finanzas:** Directorio de cuentas bancarias vinculado a la generación de carteles de pago.

---

## 🤖 2. Inteligencia Artificial e Integración IoT

*   **🖥️ Administración de Dispositivos:** Panel SuperAdmin para control de MAC Address y tokens de seguridad.
*   **📡 Sincronización telemétrica:** API RESTful robusta para conteo de pasajeros y ubicación GPS.
*   **👁️ Conteo Facial (Edge/Cloud):** Detección dual mediante **MediaPipe** (local) y **AWS** (nube).
*   **🛡️ Exclusión Biométrica:** Algoritmo para omitir automáticamente a conductores en las estadísticas de abordaje.
*   **💓 Heartbeat:** Monitoreo en tiempo real de la vitalidad de la flota.

---

## 💸 3. Recaudación y Cobranza Digital

*   **📱 Módulo Abordo (PWA):** Interfaz simplificada para operativos con soporte para trayectos suburbanos.
*   **📉 Deducciones Dinámicas:** Aplicación automática de descuentos (Estudiantes, Tercera Edad).
*   **🔍 Validación OCR (Gemini AI):** Extracción automatizada de referencias bancarias desde capturas de pantalla.
*   **🖨️ Payment Poster:** Generador dinámico de carteles con códigos QR personalizados por unidad.

---

## 📈 4. Analítica de Negocios (BI)

*   **📊 Dashboard Financiero:** KPIs de recaudación, crecimiento y comparativas históricas.
*   **🗓️ Calendario de Conexiones:** Visualización interactiva de sesiones operativas segmentadas por lapsos de inactividad de 60 minutos.
*   **🕵️ Reportes Avanzados:**
    *   **Espaciado de Unidades:** Distancia y tiempo entre buses en ruta.
    *   **Mapas de Calor:** Análisis geográfico de densidades de abordaje.
    *   **📍 Análisis de Paradas (Clustering):** Algoritmo que agrupa eventos de abordaje en "paradas lógicas" (radio 100m, ventana 1 min).
    *   **🗺️ Mapas de Demanda:** Representación visual en el mapa con marcadores dinámicos (color/tamaño) según afluencia.
    *   **Tiempos de Ruta:** Duración promedio de trayectos completos.

---

## 🛡️ 5. Seguridad y Experiencia de Usuario

*   **🔑 RBAC (Roles):** Jerarquía estricta entre Administradores, Dueños y Operativos.
*   **📜 Auditoría Forense:** Registro inalterable de cada acción crítica (Audit Logs) y **Trazabilidad de Usuario** en cada cobro manual.
*   **🧪 Entorno de Demostración (Seeders):** Generador masivo de datos operativos realistas para presentaciones y pruebas de estrés.
*   **⚡ Arquitectura SPA:** Fluidez máxima mediante Inertia.js y React.
*   **🇻🇪 Localización:** Adaptación total a husos horarios y normativas de Venezuela (Corrección de Acentos y Terminología).

---

**Última actualización:** 30 de Abril, 2026.