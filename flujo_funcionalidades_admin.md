# Flujos Funcionales y Operativos: Transport Admin

**Transport Admin** (La Nube Central o Panel Administrativo) es el núcleo tecnológico del proyecto. Se encarga de procesar de forma integral todos los ingresos económicos, centralizar la analítica y administrar las credenciales o permisos tanto de seres humanos como del hardware de cámaras empotradas (IoT) en los autobuses.

Debido a su magnitud modular, su ejecución y uso varían diametralmente tomando en consideración qué "Rol" inicie sesión en la plataforma. A continuación se desglosan a gran nivel y minuciosamente todos los flujos lógicos y operativos por los que atraviesan sus diversos actores a la hora de manipular el software.

---

## 1. El Flujo de Inicio y Ontología de Roles (Gateways)
La interacción comienza siempre en el portal de Inicio de Sesión Web. Un servicio de validación intercepta al usuario (`RBAC - Control de Acceso Basado en Roles`). Tras constatar credenciales y firmas encriptadas el flujo se bifurca irrevocablemente por tres carreteras de acceso:

1. **Flujo SuperAdmin Global:** Redirigido al panel de mantenimiento masivo de Servidor. Es el ente máximo con potestad de purgar, alterar registros inviolables, proveer y censar los Devices IoT que circulan por todo el sistema y auditar acciones.
2. **Flujo Owner (Dueño y Empresario):** Redirigido a un Workspace privado multitenant (Múltiples inquilinos). Su visual es puramente gerencial, concentrada en el macro-control, ingresos empresariales, estadísticas financieras abstractas, mapas digitales y personalizaciones.
3. **Flujo Operative (Conductores y Recaudadores):** Redirigidos inevitablemente a una Web App ligera (PWA) e inmersiva limitada netamente para asentar boletos y registrar recaudación en caliente abordo del buque. Están en "Modo de Producción".

---

## 2. Flujo de Configuración Base (La Tarea del Dueño)
Un dueño de ruta experimenta un viaje lógico de configuración progresivo conocido como *Onboarding* corporativo, el cual debe saciar para tener su flota completamente apta a producir.

### A) Asentamiento Financiero
* **Las Cuentas Bancarias:** El dueño navega hacia un directorio financiero añadiendo perfiles bancarios oficiales de su compañía (Bancos receptores de los Pagos Móviles y las Transferencias). Se almacena Cédula/RIF Oficial y formatos telefónicos filtrados bajo algoritmos de validación nacionales de Venezuela.

### B) Personal y Barreras Biométricas
* **Empleados (Drivers & Collectors):** Da de altas cuentas para sus choferes y asistentes. Obligatoriamente durante su creación exige subir un archivo fotográfico; este será procesado como rasgo biométrico de *Exclusión* y enviado a la Nube IoT para evitar que las Inteligencias Artificiales de las cámaras les cobren o infieran que son un pasajero mientras caminan por la unidad.

### C) Mapeo Tarifario de Rutas
* **Configuración Individual:** Se formulan las "Rutas". Involucra establecer Origen, Destino y Tarifas Planas o con Deducciones Especiales y Domingos. 
* **Reglas Bivalentes (Urbanas/Suburbanas):** El flujo valida inteligentemente, requiriendo ingresar una sub-tarifa si marca al trayecto como Suburbano, lo cual dispara efectos visuales e interactivos como la Generación de Carteles Multicolumna. Para garantizar confianza legal el flujo le permite adjuntar archivos escaneados de "Gacetas Oficiales" que sustenten sus montos.
* **Precios por Defectos y Edición Masiva:** Desde un flujo acelerador llamado "Ajustes de Ruta" logra configurar los inputs primarios con montos globales de su empresa o seleccionar y tildar 100 rutas y modificarles el costo universal al presionar "Actualizar Masivamente".

### D) Integración Metalmecánica y Generación de Elementos Físicos
* **Asignación del Device:** Relaciona unidades vehiculares documentales con hardware empotrado (Dispositivos registrados y otorgados en antelación por el SuperAdmin Global con Tokens MAC de Seguridad).
* **Payment Posters Exportables:** Por cada autobús finalizado en flujo, invoca un Generador Gráfico de "Carteles Imprimibles en PDF" que portan Códigos QR y el listado de las cuentas bancarias de cobro enmarcadas con la estampa de la unidad en particular lista para pegarse en los ventanales de ese y no otro vehículo.

---

## 3. Flujo en Tiempo Real y Campo Abierto (El Operativo)
Una vez en la calle, entra el eslabón recolector abordo con la PWA responsiva en sus dispositivos móviles. 

### A) Secuencia de Registro Físico o Electrónico
1. **Asignación:** El operativo enlista el Autobús dentro del cual le ha tocado montarse, cargando la parametrización tarifaria de ese autobús.
2. **Evaluación Suburbana:** De subirse a una unidad catalogada con "Precios en dos niveles" (Suburbana), se bloquean campos obligando al recaudador bajo demanda a pulsar tarjetas táctiles declarando si el pasajero que sube va a transitar el "Trayecto Corto" o el "Largo".
3. **Abono Electrónico e Inteligencia Artificial:** Si le reportan un Pago Móvil, el sistema no fuerza al operador a digitar un código de referencia kilométrico, sino que este usa la cámara trasera apuntando a la pantalla del cliente y toma una fotografía; dicha evidencia visual transita por API hacia un cerebro analítico externo OCR (Gemini AI), el cual infiere y extrae a un campo de texto los dígitos referenciales correctos para cotejos posteriores.

---

## 4. El Flujo de Sincronización Subterránea (Los Devices IoT)
A las espaldas de las peticiones Web, corren los dispositivos incrustados en las cajas de hardware físico realizando peticiones de forma automatizada sobre RestAPI:
* **Autenticación Fuerte y Exclusiones:** El hardware enciende, envía un desafío Webhook reportando la MacAddress a `transport-admin`. El panel autoriza si el estatus es 'Activo', enviándole de retroceso los rostros actualizados de los conductores que están de guardia para proteger las cuentas biométricas.
* **Envío Constante de Cargas (Telemetry Sync):** Un canal de bajada recibe constantemente los registros de los pasajeros que pasaron la puerta. Extrae, purifica e introduce en las tablas centrales MySQL el Conteo Final + TimeStamp + Geolocalización.

---

## 5. Ecosistema de Observabilidad, Analítica y Mapas
Toda la información manual e IoT termina siendo decantada visualmente ante los ojos de los jerarcas administradores o Dueños de Flotas tras un flujo de ingestión analítica.

### A) El Calendario y Cuadro de Mandos (Dashboard)
* **Gráficas Híbridas:** Consolidación monetaria entre lo que informaron tener de ingreso por ticket manual contra lo que la Cámara testificó en crudo como "Pasajeros contados" descubriendo abismos numéricos de corrupción.
* **Calendarios Interactivos:** Visión tabular mensual permitiendo desglosar los ingresos agrupados por fechas, identificando estacionalidades bajas y altas de producción.

### B) Seguimiento Físico Geoespacial (Localización)
* **Live Maps:** Mapa georeferencial dinámico alimentado por Telemetría de Pings o Heartbeats revelando dónde y qué autobuses están moviéndose.
* **Simulación o Rebobinado (Históricos):** Renderización bajo trazos (Polilíneas) y marcas semánticas detallando sobre las cartografías de OpenStreetMap cada parada real efectuada en una línea temporal donde se documentó un conteo biométrico, aportando certeza espacial a la gerencia analítica y logrando calcular rendimientos, pasajeros por barrios y latencias por bloque.

---

## 6. Monitoreo Forense Inviolable (Auditoría)
Dado el carácter de manejo de dinero y manipulación humana general, el software encapsula transaccionalmente todo a bajo nivel en la red:
* **Background Audit Logs Tracker:** Todo CRUD, actualización de precio masivo, o borrado de pasajeros, guarda tras de sí una estampilla paralela dictando el usuario IP, la variable alterada y un timestamp estricto (tz: America/Caracas) lo cual ofrece una póliza de seguridad y rastreo ante eventos perjudiciales intencionados de los operativos y deslindando dudas hacia los Dueños Globales.
