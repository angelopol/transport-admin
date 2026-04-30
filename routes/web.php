<?php

use App\Http\Controllers\BusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RouteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/health', [HealthController::class, 'publicStatus'])->name('health.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware([\App\Http\Middleware\EnsureUserIsOwner::class])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('buses', BusController::class);
        Route::post('/buses/{bus}/regenerate-token', [BusController::class, 'regenerateToken'])
            ->name('buses.regenerate-token');
        Route::get('/buses/{bus}/payment-poster', [BusController::class, 'paymentPoster'])
            ->name('buses.payment-poster');
        Route::get('/buses/{bus}/connections', [BusController::class, 'connections'])
            ->name('buses.connections');
        Route::get('/buses/{bus}/stops', [BusController::class, 'stops'])
            ->name('buses.stops');

        Route::resource('bank-accounts', \App\Http\Controllers\BankAccountController::class);
        Route::resource('routes', RouteController::class)->except(['show']);
        Route::post('/routes/settings/defaults', [\App\Http\Controllers\RouteSettingsController::class, 'saveDefaults'])->name('routes.settings.defaults');
        Route::post('/routes/settings/bulk', [\App\Http\Controllers\RouteSettingsController::class, 'bulkUpdateFares'])->name('routes.settings.bulk');
        Route::resource('drivers', DriverController::class)->except(['show']);
        Route::resource('collectors', \App\Http\Controllers\CollectorController::class)->except(['show']);
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/calendar', [\App\Http\Controllers\ReportController::class, 'calendar'])->name('reports.calendar');

        // Advanced Reports
        Route::get('/advanced-reports', [\App\Http\Controllers\Report\AdvancedReportController::class, 'index'])->name('advanced-reports.index');
        Route::get('/advanced-reports/unit-spacing', [\App\Http\Controllers\Report\AdvancedReportController::class, 'unitSpacing'])->name('advanced-reports.unit-spacing');
        Route::get('/advanced-reports/passengers-area', [\App\Http\Controllers\Report\AdvancedReportController::class, 'passengersPerArea'])->name('advanced-reports.passengers-area');
        Route::get('/advanced-reports/route-times', [\App\Http\Controllers\Report\AdvancedReportController::class, 'routeTimes'])->name('advanced-reports.route-times');
        Route::get('/advanced-reports/comparative', [\App\Http\Controllers\Report\AdvancedReportController::class, 'comparative'])->name('advanced-reports.comparative');

        // Maps
        Route::get('/maps', [\App\Http\Controllers\MapController::class, 'index'])->name('maps.index');
        Route::get('/maps/live', [\App\Http\Controllers\MapController::class, 'live'])->name('maps.live');
        Route::get('/maps/history', [\App\Http\Controllers\MapController::class, 'history'])->name('maps.history');
    });

    Route::resource('manual-entries', \App\Http\Controllers\ManualRevenueEntryController::class)->only(['index', 'create', 'store']);
    Route::post('/extract-reference', [\App\Http\Controllers\OcrController::class, 'extractReference'])->name('ocr.extract-reference');

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show']);
        Route::post('/users/{user}/logout-sessions', [\App\Http\Controllers\UserController::class, 'logoutSessions'])
            ->name('users.logout-sessions');

        // Device Management
        Route::get('/devices', [\App\Http\Controllers\DeviceController::class, 'index'])->name('devices.index');
        Route::put('/devices/{device}', [\App\Http\Controllers\DeviceController::class, 'update'])->name('devices.update');
        Route::post('/devices/{device}/toggle', [\App\Http\Controllers\DeviceController::class, 'toggleStatus'])->name('devices.toggle');
        Route::delete('/devices/{device}', [\App\Http\Controllers\DeviceController::class, 'destroy'])->name('devices.destroy');

        // Audit Logs
        Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/admin/health', [HealthController::class, 'adminIndex'])->name('admin.health');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/company', [ProfileController::class, 'updateCompany'])->name('profile.company.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
