# Tablas de Actividades y Casos de Uso Extendidos

Las siguientes tablas de flujo funcional complementan los diagramas de UML o Secuencia construidos en el ecosistema, abordando las funcionalidades lógicas a detalle en cuanto a los flujos normales del sistema y las directrices de contención (flujos alternos o de manejo de error).

---

### Caso de Uso 1: Actualización Masiva de Rutas y Tarifario Dual
**Descripción:** Cambio y configuración en lote de tarifas oficiales de pasajes urbanos y suburbanos tras un dictamen oficial.  
**Actor:** Dueño de Flota / Propietario.  
**Objetivo:** Modificar eficientemente el precio base de docenas de rutas simultáneamente, respetando intactos los descuentos pre-configurados para estudiantes o 3era edad.  
**Precondición:** El dueño se encuentra autenticado en el portal web, posee rutas activas en su base de datos corporativa.  
**Postcondición:** Todas las rutas afectadas quedan con la base tarifaria renovada y disponibles inmediatamente para el módulo PWA operativo.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El usuario navega a la vista de Rutas y selecciona el botón de "Ajustes".</li><li>El sistema despliega el Modal de Ajustes activando la pestaña de "Actualización Masiva".</li><li>El sistema precarga en una tabla iterativa todas las rutas del Dueño logueado y las deja seleccionadas por defecto.</li><li>El usuario ingresa los nuevos precios numéricos en el campo General y, si aplica, Urbano.</li><li>El usuario hace clic en Actualizar.</li><li>El sistema procesa el requerimiento, recorriendo cíclicamente las rutas y escribiendo el precio modificado directo a la Base de Datos.</li><li>El sistema arroja un mensaje de éxito cerrando el modal y refresca silenciosamente el Índice de Rutas.</li></ul> | <ul><li>**Fallo de Validación:** Si el usuario incluye valores numéricos negativos o alfanuméricos en el input de moneda, el validador frontend o Laravel Request aborta la ejecución mostrando un _span_ (texto en rojo) exigiendo un formato numérico decimal válido.</li><li>**Selección Nula:** Si el usuario por error des-marca todas las casillas del listado de sus rutas, el botón de Actualizar se desactiva por estado previniendo llamadas API vacías.</li></ul> |

---

### Caso de Uso 2: Declaración PWA en Trayecto de Doble Banda (Suburbano)
**Descripción:** Registro presencial en vehículo de pago de pasajero que transita rutas con cobro de doble instancia.  
**Actor:** Personal Operativo (Chofer / Colector).  
**Objetivo:** Permitirle al colector diferenciar ágilmente el tipo de pasaje cobrado dependiendo de qué tan largo fue el viaje topográfico del cliente.  
**Precondición:** El chofer se autentica en la PWA desde su celular estando emparejado a un autobús cuya `ruta` tenga configurado el atributo `is_suburban = true`.  
**Postcondición:** El ingreso contable se reporta en el BackOffice (Dashboard) debidamente categorizado con monto Urbano o Suburbano.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El operativo inicia sesión en su teléfono inteligente abriendo el módulo "Crear Ingreso Manual".</li><li>Selecciona el autobús físico al que sube a trabajar hoy en el input principal.</li><li>El sistema consulta de fondo a qué ruta pertenece el autobús y detecta asincrónicamente el estatus de Suburbana del trayecto.</li><li>El sistema manipula el DOM de React expandiendo un tablero intermedio de elección obligatorio de dos vías: 'Corto (Urbano)' o 'Largo (Suburbano)'.</li><li>El conductor marca el tipo de viaje que acaba de pagar el pasajero y el tipo de pasajero (ej. Estudiante).</li><li>El sistema recalcula el dinero a mostrarse en la UI mezclando la opción dual base y restando el porcentaje estudiantil de manera instanciada.</li><li>El conductor confirma. Evento procesado exitosamente en DB.</li></ul> | <ul><li>**Vehículo Desligado:** Si el operador marca un autobús que el Dueño no le ha ligado a un expediente de ruta específico pre-estructurado, el sistema oscurece y de-habilita (bloquea) la recolección deteniendo el flujo para que el chofer lo advierta.</li><li>**Afectaciones UI Fijas:** Si la ruta a elegir no es un trayecto inter-ciudades/suburbano sino regular, el tablero dinámico de vía 'Corta'/'Larga' simplemente no se muestra, limpiando la experiencia del operador.</li></ul> |

---

### Caso de Uso 3: Sincronización Subterránea de Privacidad Biométrica
**Descripción:** Encendido del Ciclo IoT en la unidad para protección perimetral del conductor contra el ojo de caja IA registradora.  
**Actor:** Dispositivo Hardware (Transport-Monitor) e IoT Sync.  
**Objetivo:** Alimentar al `FaceTracker` de la caja física contadora con rostros inmaculados que no pueden cobrar boletos para prevenir falsos +1.  
**Precondición:** El dispositivo físico está encendido y tiene una llave criptográfica (`Device_Token`) válida amarrada a un autobús del dueño.  
**Postcondición:** El algoritmo de Visión por Computadora carga una caché de caras vetadas para emparejamientos y descartes fluidos.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El motor `transport-monitor.py` de la empotrada en el bus se arranca con el arranque del vehículo.</li><li>Las clases `_init_components` disparan el módulo subyacente `CloudSync`.</li><li>El subsistema interroga a la nube central (`transport-admin`) pidiendo identidad bajo su credencial de máquina remota (MAC Address y Token HMAC).</li><li>El servidor central verifica en su modelo y devuelve una estructura JSON que contiene las URL asociadas a las fotografías de expediente de todos los Conductores de ese Dueño.</li><li>El IoT las descarga transitoriamente por HTTPS, recortándolas con OpenCV para enfocar los rostros y guardándolas en memoria unificada (RAM Collage).</li><li>La cámara inicia a grabar asumiendo la lista negra operativa.</li></ul> | <ul><li>**Ausencia de Internet Inicial:** Si al intentar encender no hay red abordo (la zona del taller no tiene 4G LTE), el `CloudSync` experimenta un `ConnectionError`. Responde al fallo cargando un snapshot local cacheado de SQLite si existe, de lo contrario alerta una advertencia y funciona sin máscara restando efectividad y confiando en limpieza en la nube posterior.</li><li>**Token Revocado:** Si un Admin suspendió dicho autobús en el panel Web por sospechas, Laravel niega la API Key (HTTP 401). El IoT local queda en StandBy y rechaza prender la lente en total por desconexión no autorizada.</li></ul> |

---

### Caso de Uso 4: Creación de Pósters Codi-Pago (Módulo Financiero / Cartelería)
**Descripción:** Exportación de infografía en PDF desde los perfiles bancarios.  
**Actor:** Dueño de Flota.  
**Objetivo:** Acoplar datos numéricos bancarios y generar láminas escaneables vía QR con la placa de un vehículo para adherir internamente a sus cristales traseros y facilitar el pago móvil de usuarios abordo.  
**Precondición:** Existen registros de entidades bancarias configuradas y Autobuses matriculados.  
**Postcondición:** Se entrega archivo `PDF` renderizado visualmente directo al disco del Dueño.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El usuario dueño navega al menú de Autobuses activos en la Web.</li><li>Pulse en la fila "Descargar Póster PDF" para una placa vehicular específica.</li><li>El controlador del sistema consulta la carga DB vinculando qué cuenta bancaria está atada a dicha celda.</li><li>El sistema compila dinámicamente usando conversores HTML/DOM y genera la codificación base del QR y el eslogan visual.</li><li>La aplicación web genera la descarga del artefacto PDF compilado con el diseño estandarizado a través de Headers `attachment/download`.</li></ul> | <ul><li>**Faltan Datos Pivote:** Si el dueño presiona el enlace pero dicho autobús no tiene Cuenta Bancaria ni cuenta de Transferencias atadas por relaciones Eloquent al sistema, el controlador evalúa negativo y redirecciona atrás inyectando un Alert/Toast que notifica *"Debe vincular una Cuenta Bancaria de forma obligatoria al vehículo en Panel Edición para procesar el Archivo"*.</li></ul> |

---

### Caso de Uso 5: Emisión de Alertas de Desconexión y Evasión Alta
**Descripción:** El sistema analiza en segundo plano el estado de vitalidad de los dispositivos IoT y correlaciona métricas para determinar anomalías operativas.  
**Actor:** Sistema Analítico (Proceso de fondo / Servicio Cron).  
**Objetivo:** Notificar inmediatamente al Dueño de Flota sobre unidades que dejaron de transmitir (desconectadas) o unidades donde los conteos biométricos superan abismalmente los pasajes reportados por los operativos manuales.  
**Precondición:** El servidor web recibe Heartbeats intermitentemente; existen métricas pasadas para comparar e ingresos financieros procesados. Umbrales de tolerancia ya configurados.  
**Postcondición:** Se escribe una Alerta Crítica en el Dashboard del Dueño para instar a una toma de acción gerencial inmediata.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El algoritmo periódico programado (Cron Job) del servidor se inicia en la ventana de tiempo.</li><li>El sistema censa todos los dispositivos IoT asignados a autobuses.</li><li>Para cada dispositivo, se calcula el delta temporal transcurrido desde su última inyección de telemetría (Último latido).</li><li>El sistema elabora una sub-consulta entre los Eventos Telemétricos recientes y los Ingresos Manuales generados ese día, arrojando la Tasa de Evasión (%).</li><li>Si el tiempo inactivo supera los minutos configurados, lanza evento `DeviceOffline`. Si la evasión supera las bandas permitidas, lanza evento `HighEvasion`.</li><li>El sistema persiste las alertas en Notificaciones de DB dirigidas al ID del Dueño, disparando campanas visuales rojas en su interfaz al iniciar sesión.</li></ul> | <ul><li>**Falsos Positivos Estacionales:** Si el colectivo evalúa un Autobús que se haya inactivo temporalmente o en paradas mecánicas pero estas ocurren en horas nocturnas o fines de semanas de "Pausa Programada", el algoritmo reconoce las tolerancias y desestima silenciosamente la alerta para no sobresaturar visualmente de falsos avisos al Dueño.</li></ul> |

---

### Caso de Uso 6: Generación y Entrega de Tokens Criptográficos de Hardware
**Descripción:** Provisión de eslabones unívocos de seguridad para acoplar o emparejar hardware periférico fabricado con la red troncal privada en la Nube.  
**Actor:** Administrador General (SuperAdmin).  
**Objetivo:** Crear y vincular de manera segura la cédula de una placa IoT (Jetson/Raspberry) asociándola permanentemente a la bóveda de la estructura de un cliente local (Dueño de Transporte).  
**Precondición:** El SuperAdministrador autenticado cuenta el dispositivo listo sobre su mesa de trabajo antes de despacharse al autobús para la instalación mecánica.  
**Postcondición:** Otorgamiento final de la clave y Bearer Token en cadena para depositarse vitaliciamente dentro del `.env` de las memorias de la Placa IoT.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>El Administrador General navega al submódulo restringido de "Gestión de Dispositivos".</li><li>Da clic en Nuevo Registro, rellenando la Dirección MAC verídica extraída y gravada en la tarjeta de red de la propia placa.</li><li>Atribuye lógicamente el aparato al perfil mercantil de un Dueño de Flota registrado en el sistema.</li><li>Laravel procesa la encomienda en el Backend y a través de librerías avanzadas genera dinámicamente un Token/Hash Irrepetible (Sanctum Tokens o Algoritmo Propio Unidireccional).</li><li>El hash real descansa cifrado en la Base de Datos; pero el Front-End despliega un pop-up con la ristra del Token revelada _"Por única vez"_ instruyendo al administrador general a copiarla directo en el hardware manual antes de descartarlo para siempre.</li></ul> | <ul><li>**Mac Address Duplicada (Colisión Lógica):** Si el Administrador incurre en un error e intenta cargar métricas de una MAC que ya existe, Laravel aborta instantáneamente dictando un *Constraint Error Database* por columna protegida `Unique`, informando visualmente que ese dispositivo físico ya opera en otra unidad.</li><li>**Pérdida Insalvable del Token:** El código revelado desaparece cerrando la ventana. Si el experto extravía esa copiada, el flujo dicta hacer clic en el botón destructivo de "Rotar Credenciales" que evapora temporalmente la confianza en la DB y crea de 0 un token blindando así los datos contra ataques.</li></ul> |

---

### Caso de Uso 7: Autenticación Desatendida Inicial del Dispositivo (Auth Sync / Handshake)
**Descripción:** Mecanismo automático de negociación web entre una caja empotrada y el Servidor Master cada ciclo de trabajo.  
**Actor:** Dispositivo IoT (Hardware Edge).  
**Objetivo:** Legitimar su existencia obteniendo autorización criptoactiva para empezar a inyectar conteos estadísticos vitales hacia los Dashboards en tiempo real.  
**Precondición:** El Hardware IoT se instala pre-alimentado con el Token de Integración secreto y tiene ruteo válido de internet inalámbrico.  
**Postcondición:** Respuesta Exitosamente validada (HTTP 200 OK), y encendido interno de motores de IA perimetral o flujos ETL abordo.  

| Flujo Normal | Flujo Alterno |
|---|---|
| <ul><li>La tarjeta enciende por un switch electrónico vehículado arrancando directamente la línea script base/Demonio de `transport-monitor.py`.</li><li>El protocolo empaqueta una primera cabecera estándar HTTP forjada con `Authorization: Bearer <TOKEN_MAQUINA>`.</li><li>Aterrizan las peticiones originadoras en `/api/auth/device` (Endpoint Intermedio), emitiendo de paso variables o flags menores como la versión del firmware desplegada internamente.</li><li>El Servidor (Laravel) intercepta su Middleware bloqueante, computando la validez criptográfica del Token asumiendo el rol y autenticando con qué entidad relacional `Device` está hablando.</li><li>Laravel emite una respuesta verde permitiendo seguir, y el módulo de `CloudSync` del Python da paso a encender las lentes de visión por computadora iniciando formalmente labores empresariales.</li></ul> | <ul><li>**Muerte Inducida (Baneo Físico):** Aunque las credenciales técnicas coincidan matemáticamente, si en el Dashboard administrativo de la Tesis se configuró el _Flag_ del hardware hacia un modo `Suspendido`, el Middleware de Laravel retornará inmediatamente un agresivo estado asincrónico _HTTP 403 Forbidden_. Bajo este flag alterno, la Raspberry apaga cualquier petición a sus cámaras resguardando dramáticamente la energía física de red de forma indefinida hasta su futuro _Unban_.</li></ul>
