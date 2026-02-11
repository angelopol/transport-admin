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
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Fleet Management (all authenticated users)
    Route::resource('buses', BusController::class);
    Route::post('/buses/{bus}/regenerate-token', [BusController::class, 'regenerateToken'])
        ->name('buses.regenerate-token');

    Route::resource('manual-entries', \App\Http\Controllers\ManualRevenueEntryController::class)->only(['index', 'create', 'store']);

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::resource('routes', RouteController::class)->except(['show']);
        Route::resource('drivers', DriverController::class)->except(['show']);
        Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show']);
        Route::resource('collectors', \App\Http\Controllers\CollectorController::class)->except(['show']);
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');

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

