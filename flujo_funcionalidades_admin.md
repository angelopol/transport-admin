# 🚀 Flujos Funcionales y Operativos: Transport Admin

**Transport Admin** es el epicentro tecnológico del ecosistema. Procesa ingresos económicos, centraliza la analítica de negocios y administra la seguridad tanto de usuarios como del hardware IoT.

---

## 🔐 1. Puerta de Enlace y Ontología de Roles
La interacción comienza en el portal de inicio de sesión, donde el sistema de **Control de Acceso Basado en Roles (RBAC)** bifurca el flujo según el perfil:

*   **⚡ SuperAdmin Global:** Acceso total al mantenimiento del servidor, purga de datos y gestión de dispositivos IoT.
*   **💼 Owner (Dueño):** Espacio gerencial multitenant enfocado en KPIs, ingresos, personal y mapas logísticos.
*   **📱 Operative (Colector/Chofer):** Interfaz PWA ligera diseñada exclusivamente para el registro de boletos en tiempo real.

---

## ⚙️ 2. Flujo de Configuración Base (Onboarding)
El dueño de ruta experimenta un viaje lógico progresivo para habilitar su flota:

### 🏦 A) Asentamiento Financiero
Configuración de cuentas bancarias (Pago Móvil/Transferencia) bajo validación de formatos nacionales.

### 👥 B) Personal y Barreras Biométricas
Registro de choferes y colectores. **Importante:** Se exige fotografía para el algoritmo de exclusión facial, evitando que la cámara cuente al personal como pasajeros.

### 🗺️ C) Mapeo Tarifario y Reglas de Negocio
*   **Configuración de Rutas:** Definición de origen, destino y tarifas (Urbanas vs Suburbanas).
*   **Edición Masiva:** Ajustes globales de precios mediante el enrutador de actualizaciones masivas.

### 📑 D) Generación de Elementos Físicos
*   **Asignación de Dispositivos:** Vinculación de hardware físico con unidades vehiculares mediante tokens MAC.
*   **Payment Posters:** Generación de carteles PDF con Códigos QR únicos por autobús.

---

## 🛣️ 3. Flujo en Campo (Operación Diaria)
El eslabón recolector utiliza la **PWA Responsiva** para la recaudación en ruta:

1.  **Asignación:** Selección de la unidad vehicular activa.
2.  **Lógica Suburbana:** Selección táctil de trayectos (Corto/Largo) que recalculan el precio dinámicamente.
3.  **IA OCR:** Captura de pantalla de pagos móviles analizada por **Gemini AI** para extracción automática de referencias.

---

## 📡 4. Sincronización Subterránea (IoT)
Procesos automatizados que ocurren sin intervención humana:

*   **Heartbeat de Seguridad:** El hardware reporta su estado y recibe actualizaciones de rostros permitidos (Exclusiones).
*   **Telemetry Sync:** Envío constante de cargas JSON con conteo de personas, marcas de tiempo y coordenadas GPS.

---

## 📊 5. Observabilidad e Inteligencia de Negocios
Decantación visual de los datos para la toma de decisiones gerenciales:

*   **📈 Dashboard Híbrido:** Contraste en tiempo real entre la recaudación manual y el conteo de la cámara (Detección de Evasión).
*   **🗓️ Calendario de Ingresos:** Vista tabular de producción mensual.
*   **📍 Live Maps & Históricos:** Rastreo en vivo y rebobinado de rutas mediante polilíneas sobre cartografía digital.

---

## 🕵️ 6. Monitoreo Forense Inviolable
Póliza de seguridad transaccional:

> [!IMPORTANT]
> **Audit Log Tracker:** Cada cambio (CRUD, edición tarifaria, borrado) genera una estampa paralela con IP, usuario y timestamp estricto, garantizando transparencia absoluta ante los Dueños.

---

**Fuente:** Arquitectura de Sistemas Polgrossi (2026).
