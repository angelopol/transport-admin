# 📝 Casos de Uso Extendidos y Actividades Operativas

Este documento desglosa detalladamente las funcionalidades lógicas del ecosistema **Transport Admin**, abordando tanto los flujos de éxito como los mecanismos de contención ante errores.

---

## 🛠️ Caso de Uso 1: Actualización Masiva de Tarifas
**Configuración en lote de precios oficiales tras dictámenes de gaceta.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | 💼 Dueño de Flota |
| **Objetivo** | Modificar precios de múltiples rutas simultáneamente |
| **Precondición** | Rutas activas en la base de datos |
| **Postcondición** | Tarifario renovado y disponible en PWA |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Navegar a **Rutas > Ajustes**. | ⚠️ **Fallo de Validación:** Si se ingresan valores negativos o texto, el sistema aborta con error visual (rojo). |
| 2. Activar pestaña **Actualización Masiva**. | 🚫 **Selección Nula:** Si no hay rutas marcadas, el botón de actualizar se inhabilita automáticamente. |
| 3. Ingresar nuevos montos (General/Urbano). | |
| 4. Procesamiento cíclico en DB vía ORM. | |
| 5. Mensaje de éxito y refresco de interfaz. | |

---

## 🚌 Caso de Uso 2: Declaración PWA en Ruta Suburbana
**Gestión de cobro dinámico en trayectos de doble instancia.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | 📱 Personal Operativo (Colector) |
| **Objetivo** | Diferenciar montos según longitud del viaje |
| **Precondición** | Autobús vinculado a ruta `is_suburban = true` |
| **Postcondición** | Ingreso categorizado correctamente en Dashboard |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Iniciar sesión y abrir **Crear Ingreso**. | 🔒 **Vehículo Desligado:** Si el bus no tiene ruta asignada, el sistema bloquea la recolección. |
| 2. Seleccionar autobús físico activo. | ✨ **Limpieza de UI:** En rutas regulares, el selector de trayecto corto/largo se oculta automáticamente. |
| 3. El sistema expande el selector de trayecto. | |
| 4. Elegir **Corto (Urbano)** o **Largo (Suburbano)**. | |
| 5. Recálculo dinámico (Base + Beneficios). | |

---

## 🔐 Caso de Uso 3: Sincronización de Privacidad Biométrica
**Protección perimetral del personal contra el conteo de la IA.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | 🤖 Dispositivo IoT (Edge) |
| **Objetivo** | Alimentar la "Lista Negra" de rostros para exclusión |
| **Precondición** | Llave criptográfica `Device_Token` válida |
| **Postcondición** | Algoritmo carga caché de rostros vetados |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Arranque del demonio `transport-monitor.py`. | 📶 **Offline:** Si no hay red, carga snapshot de SQLite local. Si no hay caché, funciona sin exclusión. |
| 2. Handshake con `transport-admin` vía HMAC. | 🚫 **Token Revocado:** Si el bus está suspendido, Laravel niega acceso (401) y la cámara no enciende. |
| 3. Descarga de fotos de expediente (Conductores). | |
| 4. Procesamiento OpenCV (Recorte y Collage). | |
| 5. Inicio de monitoreo con exclusión activa. | |

---

## 📄 Caso de Uso 4: Generación de Pósters Codi-Pago
**Exportación de infografía bancaria con QR dinámico.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | 💼 Dueño de Flota |
| **Objetivo** | Facilitar pagos digitales mediante cartelería física |
| **Precondición** | Cuentas bancarias vinculadas a la unidad |
| **Postcondición** | Entrega de archivo PDF de alta definición |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Navegar a **Autobuses > Descargar Póster**. | ❗ **Faltan Datos:** Si no hay bancos asociados, el sistema redirige al editor con aviso preventivo. |
| 2. El controlador vincula bancos y placa. | |
| 3. Compilación dinámica de QR y diseño. | |
| 4. Descarga automática del PDF estandarizado. | |

---

## 🚨 Caso de Uso 5: Alertas de Evasión y Desconexión
**Análisis forense automático de vitalidad y finanzas.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | 🖥️ Sistema Analítico (Cron Job) |
| **Objetivo** | Notificar anomalías críticas al dueño |
| **Precondición** | Recepción de Heartbeats e ingresos procesados |
| **Postcondición** | Alerta persistente en Dashboard de control |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Ejecución del Cron Job programado. | 🌙 **Pausa Programada:** El algoritmo ignora alertas en horarios nocturnos o fines de semana de inactividad. |
| 2. Censo de dispositivos y cálculo de "latidos". | |
| 3. Cruce: Telemetría vs Ingresos Manuales. | |
| 4. Disparo de eventos `DeviceOffline` o `HighEvasion`. | |
| 5. Inyección de campanas rojas en interfaz Owner. | |

---

## 🔑 Caso de Uso 6: Gestión de Tokens de Hardware
**Provisión de eslabones de seguridad para emparejamiento IoT.**

| Atributo | Detalle |
| :--- | :--- |
| **Actor** | ⚡ Administrador General (SuperAdmin) |
| **Objetivo** | Vincular físicamente una placa (MAC) a un cliente |

### 🔄 Flujo de Trabajo
| Flujo Normal | Flujo Alterno (Excepciones) |
| :--- | :--- |
| 1. Registro de MAC Address en panel restringido. | 🆔 **MAC Duplicada:** Laravel aborta por restricción de unicidad si la placa ya existe. |
| 2. Generación de Hash Irrepetible (Sanctum). | 🔄 **Pérdida de Token:** Si se pierde el código inicial, se debe rotar credenciales invalidando el anterior. |
| 3. Visualización del Token por única vez. | |
| 4. Depósito manual en `.env` del dispositivo IoT. | |

---

**Fuente:** Documentación Técnica Transport Admin (2026).
