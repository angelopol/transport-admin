<?php

use App\Http\Controllers\BusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    // Fleet Management & Dashboard (all authenticated users except operatives)
    Route::middleware([\App\Http\Middleware\PreventOperativeAccess::class])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('buses', BusController::class);
        Route::post('/buses/{bus}/regenerate-token', [BusController::class, 'regenerateToken'])
            ->name('buses.regenerate-token');
        Route::get('/buses/{bus}/payment-poster', [BusController::class, 'paymentPoster'])
            ->name('buses.payment-poster');

        Route::resource('bank-accounts', \App\Http\Controllers\BankAccountController::class);
    });

    Route::resource('manual-entries', \App\Http\Controllers\ManualRevenueEntryController::class)->only(['index', 'create', 'store']);
    Route::post('/extract-reference', [\App\Http\Controllers\OcrController::class, 'extractReference'])->name('ocr.extract-reference');

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::resource('routes', RouteController::class)->except(['show']);
        Route::resource('drivers', DriverController::class)->except(['show']);
        Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show']);
        Route::resource('collectors', \App\Http\Controllers\CollectorController::class)->except(['show']);
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');

        // Advanced Reports
        Route::get('/advanced-reports', [\App\Http\Controllers\Report\AdvancedReportController::class, 'index'])->name('advanced-reports.index');
        Route::get('/advanced-reports/unit-spacing', [\App\Http\Controllers\Report\AdvancedReportController::class, 'unitSpacing'])->name('advanced-reports.unit-spacing');
        Route::get('/advanced-reports/passengers-area', [\App\Http\Controllers\Report\AdvancedReportController::class, 'passengersPerArea'])->name('advanced-reports.passengers-area');
        Route::get('/advanced-reports/route-times', [\App\Http\Controllers\Report\AdvancedReportController::class, 'routeTimes'])->name('advanced-reports.route-times');
        // Device Management
        Route::get('/devices', [\App\Http\Controllers\DeviceController::class, 'index'])->name('devices.index');
        Route::post('/devices/{device}/toggle', [\App\Http\Controllers\DeviceController::class, 'toggleStatus'])->name('devices.toggle');
        Route::delete('/devices/{device}', [\App\Http\Controllers\DeviceController::class, 'destroy'])->name('devices.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

