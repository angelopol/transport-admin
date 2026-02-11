# SIMCI-TU - Sistema de Administración de Transporte Urbano

Este proyecto es la plataforma administrativa del sistema SIMCI-TU, diseñada para gestionar flotas de transporte público, monitorear ingresos y visualizar telemetría en tiempo real. Desarrollado como parte de un proyecto de tesis.

## 🚀 Tecnologías

Este proyecto utiliza un stack moderno y robusto:

*   **Backend:** [Laravel 12](https://laravel.com)
*   **Frontend:** [React 18](https://react.dev) con TypeScript
*   **Bridge:** [Inertia.js 2.0](https://inertiajs.com)
*   **Estilos:** [Tailwind CSS 3](https://tailwindcss.com) & HeadlessUI
*   **Base de Datos:** SQLite (Desarrollo) / MySQL (Producción)
*   **Autenticación:** Laravel Sanctum
*   **Empaquetador:** Vite

## ✨ Funcionalidades Principales

### 📊 Panel de Control (Dashboard)
*   Visualización de estadísticas en tiempo real.
*   Gráficas de pasajeros por hora (Responsivas).
*   Resumen de ingresos y unidades activas.

### 🚌 Gestión de Recursos
*   **Unidades (Buses):** Registro de vehículos, asignación de rutas y conductores.
*   **Rutas:** Definición de trayectos, tarifas y origen/destino.
*   **Conductores:** Administración de personal y licencias.

### 👥 Usuarios y Roles
*   Gestión de Administradores y Dueños de unidades.
*   Control de acceso y permisos.

### 📈 Reportes e Ingresos
*   Reportes detallados de ingresos por tipo de pasajero (Estudiante, Adulto Mayor, General).
*   Desglose por métodos de pago.
*   Exportación de datos.

### 📱 Experiencia de Usuario (UX)
*   Diseño totalmente responsivo (Vistas de tarjeta para móviles).
*   Paginación y textos localizados al Español.
*   Interfaz limpia y moderna.

### 🔗 Integración de Hardware
*   API RESTful para sincronización de conteo de pasajeros.
*   Soporte para funcionamiento offline (Buffer local en dispositivos).
*   Autenticación de dispositivos mediante Tokens.

## 🛠️ Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

### Prerrequisitos
*   PHP 8.2 o superior
*   Node.js 18+ y NPM
*   Composer
*   Git

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd transport-admin
    ```

2.  **Instalar dependencias de PHP:**
    ```bash
    composer install
    ```

3.  **Instalar dependencias de JavaScript:**
    ```bash
    npm install
    ```

4.  **Configurar entorno:**
    Copia el archivo de ejemplo y genera la clave de aplicación:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Asegúrate de configurar tu base de datos en el archivo `.env`.*

5.  **Ejecutar migraciones y seeders:**
    ```bash
    php artisan migrate --seed
    ```

## ▶️ Ejecución

Para entorno de desarrollo, puedes usar el comando simplificado que levanta tanto el servidor backend como el frontend:

```bash
composer dev
```

O ejecutarlos manualmente en terminales separadas:

**Backend:**
```bash
php artisan serve
```

**Frontend:**
```bash
npm run dev
```

## 📂 Estructura del Proyecto

*   `app/Http/Controllers`: Lógica del Backend.
*   `resources/js/Pages`: Vistas y componentes de React (Inertia).
*   `routes/api.php`: Endpoints para la integración de hardware.
*   `routes/web.php`: Rutas de la aplicación web.
*   `lang/es`: Archivos de traducción y localización.

## 🤝 Contribución

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Commit a tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.
