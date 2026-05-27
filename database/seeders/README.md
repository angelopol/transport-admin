# 📦 Datos de Demostración — PresentationSeeder

> **Guion de reportes para la presentación del sistema de monitoreo de transporte.**
> Todos los datos han sido generados para el período de los **últimos 30 días** a partir de la fecha en que se ejecutó el seeder.

---

## 🗓️ Rango de Datos Disponibles

| Concepto | Valor |
|---|---|
| **Fecha mínima** | ~30 días antes de la ejecución del seeder |
| **Fecha máxima** | Día en que se ejecutó el seeder |
| **Período recomendado para reportes** | `2026-04-27` → `2026-05-27` |
| **Mes completo recomendado** | Mayo 2026 (`2026-05`) |

> ⚠️ Si el seeder se ejecutó en una fecha diferente, ajusta las fechas en los ejemplos sumando/restando la diferencia.

---

## 👤 Credenciales de Acceso

### Administrador del Sistema

| Campo | Valor |
|---|---|
| **Email** | `admin@admin.com` |
| **Contraseña** | `adminadmin` |
| **Rol** | `admin` (acceso total, ve todas las empresas) |

---

### Empresa 1 — Transporte SIMCI C.A. _(empresa principal de demo)_

| Campo | Valor |
|---|---|
| **Email** | `owner@owner.com` |
| **Contraseña** | `ownerowner` |
| **Rol** | `owner` |
| **RIF** | J-12345678-9 |

#### Usuarios Operativos de SIMCI (conductores / colectores)

| Nombre | Email | Contraseña | Rol en flota |
|---|---|---|---|
| Carlos Martínez | `cmartinez@simci.com` | `password` | Conductor — Bus AB123CD |
| José Rodríguez | `jrodriguez@simci.com` | `password` | Conductor — Bus EF456GH |
| Luis González | `lgonzalez@simci.com` | `password` | Conductor — Bus IJ789KL |
| Pedro Flores | `pflores@simci.com` | `password` | Colector — Bus AB123CD |
| Miguel Torres | `mtorres@simci.com` | `password` | Colector — Bus EF456GH |
| Ana Díaz | `adiaz@simci.com` | `password` | Colectora — Bus IJ789KL |

---

### Empresa 2 — Línea Caracas Express C.A. _(empresa secundaria)_

| Campo | Valor |
|---|---|
| **Email** | `empresa2@demo.com` |
| **Contraseña** | `password` |
| **Rol** | `owner` |
| **RIF** | J-98765432-1 |

---

## 🚌 Flota de Autobuses

### SIMCI C.A.

| Placa | Modelo | Cap. | Ruta Asignada | Conductor | Colector |
|---|---|---|---|---|---|
| **AB123CD** | Encava ENT-610 | 45 | Petare – Plaza Venezuela | Carlos Martínez | Pedro Flores |
| **EF456GH** | Encava ENT-710 | 50 | Petare – Plaza Venezuela | José Rodríguez | Miguel Torres |
| **IJ789KL** | Yutong ZK6128 | 55 | Los Dos Caminos – El Silencio | Luis González | Ana Díaz |
| **MN012OP** | Encava ENT-610 | 45 | Los Dos Caminos – El Silencio | — | — |
| **QR345ST** | Higer KLQ6109 | 50 | Guarenas – Chacaíto (Suburbana) | — | — |

### Línea Caracas Express C.A.

| Placa | Modelo | Cap. | Ruta Asignada |
|---|---|---|---|
| **UV678WX** | Yutong ZK6128 | 55 | Altamira – Palo Verde |

---

## 🛣️ Rutas Configuradas

| Ruta | Tarifa Normal | Tarifa Dominical | Tarifa Estudiante | Tarifa Jubilado | Empresa |
|---|---|---|---|---|---|
| Petare – Plaza Venezuela | $8.00 | $10.00 | 50% descuento | $4.00 | SIMCI |
| Los Dos Caminos – El Silencio | $7.00 | $9.00 | 50% descuento | $3.50 | SIMCI |
| Guarenas – Chacaíto *(Suburbana)* | $15.00 | $18.00 | 50% descuento | $7.50 | SIMCI |
| Altamira – Palo Verde | $6.00 | $8.00 | 50% descuento | $3.00 | Línea Caracas |

---

## 📊 Guion de Reportes para la Presentación

> Usar la cuenta **`owner@owner.com`** para todos los reportes de SIMCI.

---

### 1️⃣ Reporte General de Ingresos y Pasajeros

**Ruta en la app:** `Reportes → Reporte General`

#### Escenario A — Mes completo (visión macro)

| Filtro | Valor a ingresar |
|---|---|
| Fecha inicio | `2026-05-01` |
| Fecha fin | `2026-05-27` |
| Comparar con | *(dejar vacío → compara automáticamente con período anterior)* |

**Qué se verá:**
- 📈 Gráfica de ingresos diarios con pico en horas punta (7-9 AM y 4-6 PM)
- 🧾 Distribución por tipo de pasajero: general, estudiante, jubilado, discapacitado + telemetría
- 💳 Métodos de pago: efectivo (~67%) y digital (~33%)
- ⚠️ Tasa de evasión calculada (diferencia entre conteo por cámara vs registros manuales)

---

#### Escenario B — Comparativa semana a semana (para mostrar la función de comparación)

| Filtro | Valor a ingresar |
|---|---|
| Fecha inicio | `2026-05-12` |
| Fecha fin | `2026-05-18` |
| Comparar desde | `2026-05-05` |
| Comparar hasta | `2026-05-11` |

**Qué se verá:**
- Comparación directa semana 2 vs semana 1 del mes
- Flechas de crecimiento/decrecimiento en los KPIs principales
- Diferencia en tasa de evasión entre semanas

---

#### Escenario C — Un fin de semana (para destacar tarifas dominicales)

| Filtro | Valor a ingresar |
|---|---|
| Fecha inicio | `2026-05-24` *(domingo)* |
| Fecha fin | `2026-05-25` *(lunes)* |

**Qué se verá:**
- Ingresos el domingo con tarifa dominical activa (10–18% más caro según ruta)
- Posible reducción de operaciones (el seeder omite aleatoriamente ~30-40% de domingos)

---

### 2️⃣ Calendario de Ingresos

**Ruta en la app:** `Reportes → Calendario`

| Filtro | Valor a ingresar |
|---|---|
| Mes | `2026-05` |

**Qué se verá:**
- Vista calendario con color de intensidad por día
- Días con mayor actividad: lunes–viernes en horas pico
- Domingos con operación reducida o sin datos

**También probar:**
| Filtro | Valor |
|---|---|
| Mes anterior | `2026-04` |

---

### 3️⃣ Reporte Avanzado — Pasajeros por Área (Mapa)

**Ruta en la app:** `Reportes Avanzados → Pasajeros por Área`

| Filtro | Valor a ingresar |
|---|---|
| Fecha | *(cualquier día hábil reciente, ej.)* `2026-05-20` |
| Zona en el mapa | Ver zonas disponibles abajo ↓ |

#### Zonas geográficas con datos de telemetría

Centrar el mapa en estas coordenadas para encontrar datos:

| Zona | Latitud | Longitud | Descripción |
|---|---|---|---|
| **Petare** | 10.4806 | -66.9036 | Alta densidad — Bus AB123CD y EF456GH |
| **La California** | 10.4973 | -66.8965 | Zona de tránsito intermedio |
| **Chacaíto** | 10.5009 | -66.9135 | Destino ruta suburbana Guarenas |
| **Altamira** | 10.4921 | -66.9182 | Origen ruta Línea Caracas |
| **Palo Verde** | 10.4884 | -66.8799 | Destino ruta Altamira–Palo Verde |
| **El Silencio** | 10.4814 | -66.9333 | Destino ruta Los Dos Caminos |
| **Guarenas** | 10.4744 | -66.8897 | Origen ruta suburbana |
| **Los Dos Caminos** | 10.4993 | -66.8711 | Bus IJ789KL y MN012OP |

> 💡 **Tip para la presentación:** Seleccionar la zona de **Petare** (los 2 buses de mayor ruta) y mostrar el mapa de calor de abordajes durante un día pico como el `2026-05-20` (martes).

---

### 4️⃣ Reporte Avanzado — Tiempos de Ruta

**Ruta en la app:** `Reportes Avanzados → Tiempos de Ruta`

| Filtro | Valor a ingresar |
|---|---|
| Fecha | `2026-05-20` *(martes, día con alta actividad)* |

**Qué se verá:**
- Hora promedio de inicio de operaciones (~6:00–6:30 AM)
- Hora promedio de fin (~7:00–7:30 PM)
- Duración total de jornada por bus
- Cantidad de eventos de telemetría registrados

**También probar:**
| Filtro | Valor |
|---|---|
| Fecha con menor actividad | `2026-05-04` *(domingo)* |

---

### 5️⃣ Reporte Avanzado — Espaciado de Unidades

**Ruta en la app:** `Reportes Avanzados → Espaciado de Unidades`

| Filtro | Ruta a seleccionar |
|---|---|
| Ruta | **Petare – Plaza Venezuela** (2 buses: AB123CD y EF456GH) |

**Qué se verá:**
- Posición GPS de cada bus en el mapa
- Distancia entre unidades (metros)
- Diferencia de tiempo entre últimas señales

**Otras rutas para explorar:**
| Ruta | Buses |
|---|---|
| Los Dos Caminos – El Silencio | IJ789KL y MN012OP |
| Guarenas – Chacaíto | QR345ST *(solo 1 bus)* |

---

### 6️⃣ Reporte Avanzado — Comparativo de Unidades

**Ruta en la app:** `Reportes Avanzados → Comparativo`

| Filtro | Valor a ingresar |
|---|---|
| Mes | `2026-05` |

**Qué se verá:**
- Ranking de buses por ingresos generados
- Total de pasajeros por bus (cámara vs manual)
- Tasa de evasión individual por unidad
- Diferencia de rendimiento entre buses de la misma ruta

> 💡 **Punto clave para la presentación:** Comparar AB123CD vs EF456GH (misma ruta, diferente capacidad y modelo) para evidenciar las diferencias de desempeño.

---

## 🏦 Cuentas Bancarias Registradas (SIMCI)

| Banco | N° de Cuenta | Tipo | Pago Móvil | Transferencia |
|---|---|---|---|---|
| Banesco | 0134-0001-12-0011234567 | Ahorro | ✅ Activo | ✅ Activo |
| Mercantil | 0105-0002-51-1051234567 | Corriente | ❌ Inactivo | ✅ Activo |

---

## 📱 Dispositivos IoT Registrados

| MAC Address | Bus Asignado |
|---|---|
| AA:BB:CC:DD:EE:01 | AB123CD |
| AA:BB:CC:DD:EE:02 | EF456GH |
| AA:BB:CC:DD:EE:03 | IJ789KL |
| AA:BB:CC:DD:EE:04 | MN012OP |
| AA:BB:CC:DD:EE:05 | QR345ST |
| AA:BB:CC:DD:EE:06 | UV678WX |

---

## 🎬 Orden Sugerido para la Presentación

1. **Login** como `owner@owner.com` → Dashboard principal
2. **Dashboard** → mostrar estado actual de flota (buses activos, última señal GPS)
3. **Reporte General** → Escenario A (mes completo `2026-05-01` → `2026-05-27`)
   - Destacar: ingresos totales, tasa de evasión, distribución por tipo de pasajero
4. **Calendario** → mes de mayo, visualizar días de mayor actividad
5. **Reportes Avanzados → Pasajeros por Área** → fecha `2026-05-20`, zona Petare
   - Mostrar mapa de calor y estadísticas de la zona
6. **Reportes Avanzados → Tiempos de Ruta** → fecha `2026-05-20`
   - Mostrar horas de inicio/fin y duración de jornada
7. **Reportes Avanzados → Comparativo** → mes `2026-05`
   - Destacar diferencias de rendimiento entre unidades
8. **Reporte General con comparación** → Escenario B (comparativa semanal)
   - Mostrar funcionalidad de períodos personalizados

---

## 🔄 Cómo Re-ejecutar el Seeder

```bash
# Solo PresentationSeeder (no borra datos anteriores, usa firstOrCreate)
php artisan db:seed --class=PresentationSeeder

# Seeder completo (incluye admin + presentación)
php artisan db:seed

# Reset completo (⚠️ borra toda la base de datos)
php artisan migrate:fresh --seed
```

> ⚠️ `PresentationSeeder` usa `firstOrCreate` e `insertOrIgnore` para ser idempotente — se puede ejecutar múltiples veces sin duplicar datos estáticos. Los eventos de telemetría e ingresos manuales solo se insertan si no existen ya.
